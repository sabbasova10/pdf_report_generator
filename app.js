require("dotenv").config();
const express = require("express");
const app = express();
const fs = require("fs");

const PORT = process.env.PORT;
app.use(express.json());

app.get("/health", (req, res) => {
    return res.status(200).json({status: "ok"});
});

app.listen(PORT, (err) => {
    if (err){
        throw err;
    }
    console.log(`App is listening to port ${PORT}`);
});