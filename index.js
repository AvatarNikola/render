const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

const { Client } = require("pg");
const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

client.connect();

client.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(50));`, (err, res) => {
	if (err) throw err;
	console.log("Table is successfully created");
});
