import db from "../config/db.js";

export async function login(username) {
  return findUserByUsername(username);
}

export async function findUserByUsername(username) {
  const [rows] = await db.execute(
    "SELECT * FROM admin_users WHERE username = ?",
    [username],
  );

  return rows[0] || null;
}

export async function createAdminUser(username, passwordHash) {
  const [resultRows, result] = await db.execute(
    db.isPostgres
      ? "INSERT INTO admin_users(username, password) VALUES (?, ?) RETURNING id"
      : "INSERT INTO admin_users(username, password) VALUES (?, ?)",
    [username, passwordHash],
  );

  return result.insertId ?? resultRows?.[0]?.id ?? resultRows;
}
