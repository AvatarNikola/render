const express = require("express");
const cors = require("cors"); // Импортируем cors
const app = express();
// Включаем CORS для всех запросов
app.use(cors());
const { Client } = require("pg");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Middleware для проверки токена
app.use((req, res, next) => {
	const accessToken = req.headers["authorization"];
	if (accessToken === process.env.ACCESS_TOKEN) {
		next();
	} else {
		res.status(403).json({ error: "Access denied" });
	}
});

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

// Создание таблицы tea, если она ещё не создана
client.query(
	`CREATE TABLE teas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255),
  description TEXT,
  image VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL
);`,
	(err) => {
		if (err) {
			console.error("Ошибка при создании таблицы", err);
		} else {
			console.log("Таблица 'tea' успешно создана или уже существует");
		}
	}
);

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
