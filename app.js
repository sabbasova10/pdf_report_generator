require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('report.db');
const { chromium } = require("playwright");

const PORT = process.env.PORT;
app.use(express.json());

db.exec("DROP TABLE IF EXISTS books");
db.exec("DROP TABLE IF EXISTS reports");

db.exec(`
    CREATE TABLE books(
        id INTEGER PRIMARY KEY,
        title TEXT,
        price REAL,
        rating TEXT,
        url TEXT
    )`);

db.exec(`
    CREATE TABLE reports(
        id INTEGER PRIMARY KEY,
        path TEXT,
        created_at DATETIME
    )`);

const entries = JSON.parse(fs.readFileSync("./books.json", "utf-8"));

const insertStmt = db.prepare(`
    INSERT INTO books (title, price, rating, url) 
    VALUES (?, ?, ?, ?)
`);

for (const entry of entries) {
    insertStmt.run(entry.title, entry.price_gbp, entry.rating_text, entry.product_url);
}

async function htmlToPdf(html){
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle' });
    
    const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        printBackground: true,
    });
    
    await browser.close();
    return pdf;
}

function getReportData(){

    const number = db.prepare("SELECT COUNT(*) AS total FROM books");
    const averagePrice = db.prepare("SELECT AVG(price) AS avg_price FROM books");
    const topFive = db.prepare("SELECT * FROM books ORDER BY price DESC LIMIT 5");
    const allBooks = db.prepare("SELECT * FROM books");

    const reportData = {
        books_total: number.get().total,
        average_price: averagePrice.get().avg_price,
        top_5: topFive.all(),
        all_books: allBooks.all() 
    };

    return reportData;

};


function createHTML(reportData){

    const top5 = reportData.top_5.map(book => `
        <tr>
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>£${book.price}</td>
            <td>${book.rating}</td>
            <td>${book.url}</td>
        </tr>
        `).join('');

    const all = reportData.all_books.map(book => `
        <tr>
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>£${book.price}</td>
            <td>${book.rating}</td>
            <td>${book.url}</td>
        </tr>
        `).join('');
    
    const html = `
        <html>
            <head>
                <title>${new Date().toISOString().split('T')[0]}</title>
                <style>
                    tr { break-inside: avoid; }
                </style>
            </head>
            <body>
                <h3>Total number of books: </h3><p>${reportData.books_total}</p>
                <h3>Average price: </h3><p>${reportData.average_price.toFixed(2)}</p>

                <h3>Top 5 by price</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${top5}
                    </tbody>
                </table>

            <h3>All books</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${all}
                    </tbody>
                </table>

            </body>
        </html>
    `;

    return html;
}

app.get("/health", async (req, res) => {
    return res.status(200).json({status: "ok"});
});

app.post("/reports", async (req, res) => {
    const reportData = getReportData();
    const html = createHTML(reportData);
    const pdf = await htmlToPdf(html);

    const time = Date.now();

    if(!fs.existsSync("reports")) fs.mkdirSync("reports");
    const filePath = `reports/${time}.pdf`;
    fs.writeFileSync(filePath, pdf);
    const addReport = db.prepare("INSERT INTO reports (path, created_at) VALUES (?, ?)").run(filePath, time);

    return res.status(201).json({id: addReport.lastInsertRowid, file: filePath, message: "Created"});
});

app.get("/reports/:id", async (req, res) => {
    
    const reportID = req.params.id;
    const file = db.prepare("SELECT * FROM reports WHERE id = (?)").get(reportID);

    if (!file) return res.status(404).json({message: "FileNotFound"});
    return res.status(200).json({link: file.path});
});

app.get("/reports/:id/file", async (req, res) => {
    
    const reportID = req.params.id;
    const file = db.prepare("SELECT * FROM reports WHERE id = (?)").get(reportID);

    if (!file) return res.status(404).json({message: "FileNotFound"});
    return res.sendFile(path.resolve(file.path));
    
});


app.listen(PORT, (err) => {
    if (err){
        throw err;
    }
    console.log(`App is listening to port ${PORT}`);
});