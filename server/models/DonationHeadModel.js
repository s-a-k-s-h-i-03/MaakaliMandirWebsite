import db from "../config/db.js";

let donationHeadSchemaPromise;

const defaultHeads = [
  {
    name: "Tel Kalash",
    description: "तेल ज्योति कलश",
    minimum_amount: 101,
    status: "Active",
  },
  {
    name: "Jawara Kalash",
    description: "जवारे कलश",
    minimum_amount: 101,
    status: "Active",
  },
];

async function ensureDonationHeadsSchema() {
  if (!donationHeadSchemaPromise) {
    donationHeadSchemaPromise = (async () => {
      await db.query(
        db.isPostgres
          ? `
            CREATE TABLE IF NOT EXISTS donation_heads (
              id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT NULL,
              minimum_amount NUMERIC(10, 2) NOT NULL DEFAULT 50,
              status VARCHAR(16) NOT NULL DEFAULT 'Active',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `
          : `
            CREATE TABLE IF NOT EXISTS donation_heads (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT NULL,
              minimum_amount DECIMAL(10, 2) NOT NULL DEFAULT 50,
              status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
          `,
      );

      const [countRows] = await db.query("SELECT COUNT(*) AS total FROM donation_heads");

      if (Number(countRows[0]?.total || 0) === 0) {
        for (const head of defaultHeads) {
          await db.execute(
            `
              INSERT INTO donation_heads (name, description, minimum_amount, status)
              VALUES (?, ?, ?, ?)
            `,
            [head.name, head.description, head.minimum_amount, head.status],
          );
        }
      }

      for (const head of defaultHeads) {
        await db.execute(
          `
            UPDATE donation_heads
            SET description = ?
            WHERE name = ? AND (description IS NULL OR description <> ?)
          `,
          [head.description, head.name, head.description],
        );
      }
    })();
  }

  return donationHeadSchemaPromise;
}

export async function findAllHeads() {
  await ensureDonationHeadsSchema();
  const [rows] = await db.execute(
    "SELECT id, name, description, minimum_amount, status, created_at, updated_at FROM donation_heads ORDER BY name ASC",
  );

  return rows;
}

export async function findActiveHeads() {
  await ensureDonationHeadsSchema();
  const [rows] = await db.execute(
    "SELECT id, name, description, minimum_amount, status, created_at, updated_at FROM donation_heads WHERE status = 'Active' ORDER BY name ASC",
  );

  return rows;
}

export async function findHeadById(id) {
  await ensureDonationHeadsSchema();
  const [rows] = await db.execute(
    "SELECT id, name, description, minimum_amount, status, created_at, updated_at FROM donation_heads WHERE id = ? LIMIT 1",
    [id],
  );

  return rows[0] || null;
}

export async function createHead(payload) {
  await ensureDonationHeadsSchema();
  const [resultRows, result] = await db.execute(
    db.isPostgres
      ? `
        INSERT INTO donation_heads (name, description, minimum_amount, status)
        VALUES (?, ?, ?, ?)
        RETURNING id
      `
      : `
        INSERT INTO donation_heads (name, description, minimum_amount, status)
        VALUES (?, ?, ?, ?)
      `,
    [payload.name, payload.description, payload.minimum_amount, payload.status],
  );

  return findHeadById(result.insertId ?? resultRows?.[0]?.id);
}

export async function updateHead(id, payload) {
  await ensureDonationHeadsSchema();
  const [result] = await db.execute(
    `
      UPDATE donation_heads
      SET name = ?, description = ?, minimum_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [payload.name, payload.description, payload.minimum_amount, payload.status, id],
  );

  return result.affectedRows > 0 ? findHeadById(id) : null;
}

export async function deleteHead(id) {
  await ensureDonationHeadsSchema();
  const [result] = await db.execute("DELETE FROM donation_heads WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
