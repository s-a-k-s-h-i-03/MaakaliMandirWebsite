import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "maakalisonkundgpm"
});

const hashed = await bcrypt.hash("admin123", 10);

await db.execute(
  "INSERT INTO admin_users(username, password) VALUES (?, ?)",
  ["admin", hashed]
);

console.log("Admin created");
process.exit();