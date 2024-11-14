const express = require("express");
const cors = require("cors"); // Импортируем cors
const app = express();
// Включаем CORS для всех запросов
app.use(cors());
const { Client } = require("pg");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

// Подключение к базе данных PostgreSQL
const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

client.connect();

// Маршрут для добавления нового чая
app.post("/add-tea", async (req, res) => {
	const { title, description } = req.body;

	if (!title) {
		return res.status(400).json({ error: "Название чая обязательно" });
	}

	try {
		const result = await client.query("INSERT INTO tea (title, description) VALUES ($1, $2) RETURNING *", [
			title,
			description,
		]);
		res.status(201).json({ message: "Чай добавлен", tea: result.rows[0] });
	} catch (err) {
		console.error("Ошибка при добавлении чая", err);
		res.status(500).json({ error: "Ошибка при добавлении чая" });
	}
});

// Маршрут для удаления чая по id
app.delete("/delete-tea/:id", async (req, res) => {
	const teaId = req.params.id;

	try {
		const result = await client.query("DELETE FROM tea WHERE id = $1 RETURNING *", [teaId]);

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Чай не найден" });
		}

		res.json({ message: "Чай удален", tea: result.rows[0] });
	} catch (err) {
		console.error("Ошибка при удалении чая", err);
		res.status(500).json({ error: "Ошибка при удалении чая" });
	}
});

// Маршрут для получения одного чая по id
app.get("/get-tea/:id", async (req, res) => {
	const teaId = req.params.id;

	try {
		const result = await client.query("SELECT * FROM tea WHERE id = $1", [teaId]);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Чай не найден" });
		}

		res.status(200).json({ tea: result.rows[0] });
	} catch (err) {
		console.error("Ошибка при получении чая", err);
		res.status(500).json({ error: "Ошибка при получении чая" });
	}
});

// Маршрут для получения всех чаёв
app.get("/get-teas", async (req, res) => {
	try {
		const result = await client.query("SELECT * FROM tea");
		res.status(200).json({ teas: result.rows });
	} catch (err) {
		console.error("Ошибка при получении чаёв", err);
		res.status(500).json({ error: "Ошибка при получении чаёв" });
	}
});
