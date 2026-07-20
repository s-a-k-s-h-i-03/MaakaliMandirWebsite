import db from "../config/db.js";

let donationSchemaPromise;

function serializeGatewayResponse(gatewayResponse) {
  return gatewayResponse ? JSON.stringify(gatewayResponse) : null;
}

function parseJsonValue(value) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? JSON.parse(value) : value;
}

function mapDonationRow(row) {
  return {
    ...row,
    gateway_response: parseJsonValue(row.gateway_response),
  };
}

export async function ensureDonationSchema() {
  if (!donationSchemaPromise) {
    donationSchemaPromise = (async () => {
      await db.query(
        db.isPostgres
          ? `
            CREATE TABLE IF NOT EXISTS donations (
              id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
              receipt_no VARCHAR(100) NOT NULL,
              order_id VARCHAR(100) NOT NULL,
              transaction_id VARCHAR(150) NULL,
              donor_name VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL,
              phone VARCHAR(30) NOT NULL,
              address TEXT NOT NULL,
              head_id INTEGER NOT NULL,
              amount NUMERIC(10, 2) NOT NULL,
              payment_method VARCHAR(50) NOT NULL,
              payment_status VARCHAR(16) NOT NULL DEFAULT 'Pending',
              gateway VARCHAR(100) NOT NULL DEFAULT 'mock',
              gateway_response JSONB NULL,
              message TEXT NULL,
              receipt_path VARCHAR(500) NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT fk_donations_head FOREIGN KEY (head_id) REFERENCES donation_heads(id)
            )
          `
          : `
            CREATE TABLE IF NOT EXISTS donations (
              id INT AUTO_INCREMENT PRIMARY KEY,
              receipt_no VARCHAR(100) NOT NULL,
              order_id VARCHAR(100) NOT NULL,
              transaction_id VARCHAR(150) NULL,
              donor_name VARCHAR(255) NOT NULL,
              email VARCHAR(255) NOT NULL,
              phone VARCHAR(30) NOT NULL,
              address TEXT NOT NULL,
              head_id INT NOT NULL,
              amount DECIMAL(10, 2) NOT NULL,
              payment_method VARCHAR(50) NOT NULL,
              payment_status ENUM('Pending', 'Success', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Pending',
              gateway VARCHAR(100) NOT NULL DEFAULT 'mock',
              gateway_response JSON NULL,
              message TEXT NULL,
              receipt_path VARCHAR(500) NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              CONSTRAINT fk_donations_head FOREIGN KEY (head_id) REFERENCES donation_heads(id)
            )
          `,
      );

      await db.query(
        db.isPostgres
          ? `
            CREATE TABLE IF NOT EXISTS payment_logs (
              id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
              donation_id INTEGER NOT NULL,
              event VARCHAR(100) NOT NULL,
              payload JSONB NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT fk_payment_logs_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
            )
          `
          : `
            CREATE TABLE IF NOT EXISTS payment_logs (
              id INT AUTO_INCREMENT PRIMARY KEY,
              donation_id INT NOT NULL,
              event VARCHAR(100) NOT NULL,
              payload JSON NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT fk_payment_logs_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
            )
          `,
      );
    })();
  }

  return donationSchemaPromise;
}

export async function createDonation(payload) {
  await ensureDonationSchema();
  const [resultRows, result] = await db.execute(
    db.isPostgres
      ? `
        INSERT INTO donations (
          receipt_no,
          order_id,
          transaction_id,
          donor_name,
          email,
          phone,
          address,
          head_id,
          amount,
          payment_method,
          payment_status,
          gateway,
          gateway_response,
          message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id
      `
      : `
        INSERT INTO donations (
          receipt_no,
          order_id,
          transaction_id,
          donor_name,
          email,
          phone,
          address,
          head_id,
          amount,
          payment_method,
          payment_status,
          gateway,
          gateway_response,
          message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    [
      payload.receipt_no,
      payload.order_id,
      payload.transaction_id || null,
      payload.donor_name,
      payload.email,
      payload.phone,
      payload.address,
      payload.head_id,
      payload.amount,
      payload.payment_method,
      payload.payment_status,
      payload.gateway,
      serializeGatewayResponse(payload.gateway_response),
      payload.message || null,
    ],
  );

  return findDonationById(result.insertId ?? resultRows?.[0]?.id ?? resultRows?.insertId);
}

export async function findDonationById(id) {
  await ensureDonationSchema();
  const [rows] = await db.execute(
    `
      SELECT
        d.id,
        d.receipt_no,
        d.order_id,
        d.transaction_id,
        d.donor_name,
        d.email,
        d.phone,
        d.address,
        d.head_id,
        d.amount,
        d.payment_method,
        d.payment_status,
        d.gateway,
        d.gateway_response,
        d.message,
        d.receipt_path,
        d.created_at,
        d.updated_at,
        h.name AS donation_head,
        h.minimum_amount
      FROM donations d
      INNER JOIN donation_heads h ON h.id = d.head_id
      WHERE d.id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] ? mapDonationRow(rows[0]) : null;
}

export async function findDonationByOrderId(orderId) {
  await ensureDonationSchema();
  const [rows] = await db.execute(
    `
      SELECT
        d.id,
        d.receipt_no,
        d.order_id,
        d.transaction_id,
        d.donor_name,
        d.email,
        d.phone,
        d.address,
        d.head_id,
        d.amount,
        d.payment_method,
        d.payment_status,
        d.gateway,
        d.gateway_response,
        d.message,
        d.receipt_path,
        d.created_at,
        d.updated_at,
        h.name AS donation_head,
        h.minimum_amount
      FROM donations d
      INNER JOIN donation_heads h ON h.id = d.head_id
      WHERE d.order_id = ?
      LIMIT 1
    `,
    [orderId],
  );

  return rows[0] ? mapDonationRow(rows[0]) : null;
}

export async function updateDonation(id, payload) {
  await ensureDonationSchema();
  const [result] = await db.execute(
    `
      UPDATE donations
      SET
        donor_name = ?,
        email = ?,
        phone = ?,
        address = ?,
        head_id = ?,
        amount = ?,
        payment_method = ?,
        payment_status = ?,
        transaction_id = ?,
        gateway = ?,
        gateway_response = ?,
        message = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      payload.donor_name,
      payload.email,
      payload.phone,
      payload.address,
      payload.head_id,
      payload.amount,
      payload.payment_method,
      payload.payment_status,
      payload.transaction_id || null,
      payload.gateway,
      serializeGatewayResponse(payload.gateway_response),
      payload.message || null,
      id,
    ],
  );

  return result.affectedRows > 0 ? findDonationById(id) : null;
}

export async function updateDonationStatus(id, payload) {
  await ensureDonationSchema();
  const [result] = await db.execute(
    `
      UPDATE donations
      SET
        payment_status = ?,
        transaction_id = ?,
        gateway = ?,
        gateway_response = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      payload.payment_status,
      payload.transaction_id || null,
      payload.gateway,
      serializeGatewayResponse(payload.gateway_response),
      id,
    ],
  );

  return result.affectedRows > 0 ? findDonationById(id) : null;
}

export async function deleteDonation(id) {
  await ensureDonationSchema();
  const [result] = await db.execute("DELETE FROM donations WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function findAllDonations(filters = {}) {
  await ensureDonationSchema();
  const clauses = [];
  const params = [];

  if (filters.search) {
    clauses.push("(d.receipt_no LIKE ? OR d.donor_name LIKE ? OR d.phone LIKE ? OR h.name LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.head_id) {
    clauses.push("d.head_id = ?");
    params.push(filters.head_id);
  }

  if (filters.payment_status) {
    clauses.push("d.payment_status = ?");
    params.push(filters.payment_status);
  }

  if (filters.payment_method) {
    clauses.push("d.payment_method = ?");
    params.push(filters.payment_method);
  }

  if (filters.date_from) {
    clauses.push("DATE(d.created_at) >= ?");
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    clauses.push("DATE(d.created_at) <= ?");
    params.push(filters.date_to);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const [rows] = await db.execute(
    `
      SELECT
        d.id,
        d.receipt_no,
        d.order_id,
        d.transaction_id,
        d.donor_name,
        d.email,
        d.phone,
        d.address,
        d.head_id,
        d.amount,
        d.payment_method,
        d.payment_status,
        d.gateway,
        d.gateway_response,
        d.message,
        d.receipt_path,
        d.created_at,
        d.updated_at,
        h.name AS donation_head,
        h.minimum_amount
      FROM donations d
      INNER JOIN donation_heads h ON h.id = d.head_id
      ${whereClause}
      ORDER BY d.created_at DESC
    `,
    params,
  );

  return rows.map(mapDonationRow);
}

export async function getDonationStats() {
  await ensureDonationSchema();
  const [rows] = await db.execute(`
    SELECT
      COUNT(*) AS totalDonations,
      COALESCE(SUM(amount), 0) AS totalAmount,
      COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN amount ELSE 0 END), 0) AS todayAmount,
      COALESCE(SUM(CASE
        WHEN EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
         AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        THEN amount ELSE 0 END), 0) AS monthlyAmount,
      SUM(CASE WHEN payment_status = 'Pending' THEN 1 ELSE 0 END) AS pendingPayments,
      SUM(CASE WHEN payment_status = 'Success' THEN 1 ELSE 0 END) AS successfulPayments,
      SUM(CASE WHEN payment_status = 'Failed' THEN 1 ELSE 0 END) AS failedPayments
    FROM donations
  `);

  return rows[0] || {
    totalDonations: 0,
    totalAmount: 0,
    todayAmount: 0,
    monthlyAmount: 0,
    pendingPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
  };
}
