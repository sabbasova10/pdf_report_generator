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
    


};

app.get("/health", (req, res) => {
    const command = db.prepare("SELECT COUNT(*) books");
    const number = command.run();
    return res.status(200).json({status: "ok", books: number});
});

getReportData();

app.listen(PORT, (err) => {
    if (err){
        throw err;
    }
    console.log(`App is listening to port ${PORT}`);
});