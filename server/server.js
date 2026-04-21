import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { Parser } from "json2csv";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 5000);

const SECRET = "secret123";
const uploadsDir = path.resolve(__dirname, "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "maakalisonkundgpm"
};

//
// MIDDLEWARE
//
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/assets", express.static(path.resolve(__dirname, "../assets")));
app.use("/uploads", express.static(uploadsDir));

//
// AUTH
//
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);


//
// NAVRATRI API 
app.get("/api/navratri", async (req, res) => {
  try {
    const { type } = req.query;

    const headMap = {
      tel: "001",
      ghrit: "002",
      jawara: "003"
    };

    const headid = headMap[type];

    if (!headid) {
      return res.status(400).json({ message: "Invalid type" });
    }

    const db = await mysql.createConnection(dbConfig);

    const [rows] = await db.execute(
      "SELECT * FROM payeedetail WHERE headid = ?",
      [headid]
    );

    await db.end();

    // ✅ FORMAT DATA (IMPORTANT CHANGE)
    const formatted = rows.map((r) => ({
      kalashNo: r.recno,
      receiptNo: r.orderid,
      name: r.udf1,
      address: r.udf4
    }));

    res.json({ items: formatted });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//
// ADMIN LOGIN
//
app.post("/api/admin/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const db = await mysql.createConnection(dbConfig);

  const [rows] = await db.execute(
    "SELECT * FROM admin_users WHERE username = ?",
    [username]
  );

  await db.end();

  if (!rows.length) {
    return res.status(401).json({ message: "Invalid user" });
  }

  const isMatch = await bcrypt.compare(password, rows[0].password);

  if (!isMatch) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ id: rows[0].id }, SECRET, { expiresIn: "1d" });

  res.json({ token });
}));

//
// DONATIONS
//
app.get("/api/admin/donations", auth, asyncHandler(async (req, res) => {
  const db = await mysql.createConnection(dbConfig);
  const [rows] = await db.execute("SELECT * FROM payeedetail");
  await db.end();
  res.json(rows);
}));

//
// EXPORT DONATIONS
//
app.get("/api/admin/export/donations", auth, asyncHandler(async (_req, res) => {
  const db = await mysql.createConnection(dbConfig);
  const [rows] = await db.execute("SELECT * FROM payeedetail");
  await db.end();

  const parser = new Parser();
  const csv = parser.parse(rows);

  res.header("Content-Type", "text/csv");
  res.attachment("donations.csv");
  res.send(csv);
}));

//
// EXPORT NAVRATRI (FIXED)
//
app.get("/api/admin/export/navratri", async (req, res) => {
  try {
    const { type } = req.query;

    const headMap = {
      tel: "001",
      ghrit: "002",
      jawara: "003"
    };

    const headid = headMap[type];

    if (!headid) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const db = await mysql.createConnection(dbConfig);

    const [rows] = await db.execute(
      "SELECT * FROM payeedetail WHERE headid = ?",
      [headid]
    );

    await db.end();

    // Format for Excel 
    const formatted = rows.map((r) => ({
      "कलश क्र.": r.recno,
      "रसीद/कलश क्र.": r.orderid,
      "नाम": r.udf1,
      "पता": r.udf4
    }));

    const parser = new Parser();
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment(`${type}.csv`);
    res.send(csv);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//
// EVENTS 
//
app.get("/api/events", asyncHandler(async (_req, res) => {
  const db = await mysql.createConnection(dbConfig);
  const [rows] = await db.execute("SELECT * FROM events ORDER BY date DESC");
  await db.end();
  res.json(rows);
}));

//
// START SERVER
//
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});