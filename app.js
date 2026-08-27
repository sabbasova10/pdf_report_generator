require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('report.db');

const PORT = process.env.PORT;
app.use(express.json());

db.exec("DROP TABLE IF EXISTS books");
db.exec(`
    CREATE TABLE books(
        id INTEGER PRIMARY KEY,
        title TEXT,
        price REAL,
        rating TEXT,
        url TEXT
    )`);

const entries = JSON.parse(fs.readFileSync("./books.json", "utf-8"));

const insertStmt = db.prepare(`
    INSERT INTO books (title, price, rating, url) 
    VALUES (?, ?, ?, ?)
`);

for (const entry of entries) {
    insertStmt.run(entry.title, entry.price_gbp, entry.rating_text, entry.product_url);
}

function getReportData(){

    const number = db.prepare("SELECT COUNT(*) AS total FROM books");
    const averagePrice = db.prepare("SELECT AVG(price) AS avg_price FROM books");
    const topFive = db.prepare("SELECT * FROM books ORDER BY price DESC LIMIT 5");
    const ratingGroups = db.prepare("SELECT rating, COUNT(*) AS count FROM books GROUP BY rating");

    const reportData = {
        books_total: number.get().total,
        average_price: averagePrice.get().avg_price,
        top_5: topFive.all(),
        rating_groups: ratingGroups.all() 
    };

    return reportData;

};

app.get("/health", (req, res) => {
    const reportData = getReportData();
    return res.status(200).json({status: "ok", report: reportData});
});


app.listen(PORT, (err) => {
    if (err){
        throw err;
    }
    console.log(`App is listening to port ${PORT}`);
});