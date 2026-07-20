import db from "../config/db.js";

let payeeDetailColumnsPromise;

async function getPayeeDetailColumns() {
  if (!payeeDetailColumnsPromise) {
    payeeDetailColumnsPromise = (async () => {
      return db.getColumns("payeedetail");
    })();
  }

  return payeeDetailColumnsPromise;
}

function hasColumn(columns, name) {
  return columns.has(name);
}

function pickFirstExisting(columns, names) {
  return names.find((name) => hasColumn(columns, name)) || null;
}

async function getNextRecno(recnoColumn) {
  if (!recnoColumn) {
    return null;
  }

  const [rows] = await db.query(
    `SELECT COALESCE(MAX(CAST(${recnoColumn} AS ${db.isPostgres ? "INTEGER" : "UNSIGNED"})), 0) + 1 AS nextRecno FROM payeedetail`,
  );

  return rows[0]?.nextRecno ?? 1;
}

export async function getNavratri(headid) {
  return getNavratriByHeadId(headid);
}

export async function exportNavratri(headid) {
  return getNavratriByHeadId(headid);
}

export async function getNavratriByHeadId(headid) {
  const [rows] = await db.execute(
    "SELECT * FROM payeedetail WHERE headid = ?",
    [headid],
  );

  return rows;
}

export async function deleteNavratriByHeadId(headid) {
  const [result] = await db.execute(
    "DELETE FROM payeedetail WHERE headid = ?",
    [headid],
  );

  return result.affectedRows || 0;
}

export async function deleteNavratriRegistration(headid, { recno, orderid }) {
  const hasRecno = recno !== undefined && recno !== null && String(recno).trim() !== "";
  const hasOrderId = orderid !== undefined && orderid !== null && String(orderid).trim() !== "";

  if (!hasRecno && !hasOrderId) {
    throw new Error("A Kalash number or receipt number is required to delete a registration.");
  }

  const clauses = ["headid = ?"];
  const values = [headid];

  if (hasRecno) {
    clauses.push("recno = ?");
    values.push(recno);
  }

  if (hasOrderId) {
    clauses.push("orderid = ?");
    values.push(orderid);
  }

  const sql = db.isPostgres
    ? `
      DELETE FROM payeedetail
      WHERE ctid IN (
        SELECT ctid
        FROM payeedetail
        WHERE ${clauses.join(" AND ")}
        LIMIT 1
      )
    `
    : `DELETE FROM payeedetail WHERE ${clauses.join(" AND ")} LIMIT 1`;

  const [result] = await db.execute(sql, values);

  return result.affectedRows || 0;
}

export async function createNavratriRegistration(payload) {
  const columns = await getPayeeDetailColumns();
  const insertColumns = [];
  const values = [];

  const recnoColumn = pickFirstExisting(columns, ["recno", "RecNo"]);
  const orderIdColumn = pickFirstExisting(columns, ["orderid", "order_id", "OrderId"]);
  const amountColumn = pickFirstExisting(columns, ["amount", "Amount"]);
  const nameColumn = pickFirstExisting(columns, ["udf1", "name", "donor_name"]);
  const emailColumn = pickFirstExisting(columns, ["udf2", "email"]);
  const phoneColumn = pickFirstExisting(columns, ["udf3", "phone", "mobile"]);
  const addressColumn = pickFirstExisting(columns, ["udf4", "address"]);
  const headIdColumn = pickFirstExisting(columns, ["headid", "head_id"]);
  const createdAtColumn = pickFirstExisting(columns, ["created_at", "date"]);
  const statusColumn = pickFirstExisting(columns, ["payment_status", "status"]);

  if (recnoColumn) {
    insertColumns.push(recnoColumn);
    values.push(await getNextRecno(recnoColumn));
  }

  if (orderIdColumn) {
    insertColumns.push(orderIdColumn);
    values.push(payload.order_id);
  }

  if (amountColumn) {
    insertColumns.push(amountColumn);
    values.push(payload.amount);
  }

  if (nameColumn) {
    insertColumns.push(nameColumn);
    values.push(payload.name);
  }

  if (emailColumn) {
    insertColumns.push(emailColumn);
    values.push(payload.email);
  }

  if (phoneColumn) {
    insertColumns.push(phoneColumn);
    values.push(payload.phone);
  }

  if (addressColumn) {
    insertColumns.push(addressColumn);
    values.push(payload.address);
  }

  if (headIdColumn) {
    insertColumns.push(headIdColumn);
    values.push(payload.legacy_head_id);
  }

  if (createdAtColumn === "date") {
    insertColumns.push(createdAtColumn);
    values.push(new Date());
  }

  if (statusColumn === "payment_status") {
    insertColumns.push(statusColumn);
    values.push("Pending");
  }

  if (insertColumns.length === 0) {
    throw new Error("Unable to create Navratri registration because payeedetail has no compatible columns.");
  }

  const placeholders = insertColumns.map(() => "?").join(", ");

  await db.execute(
    `INSERT INTO payeedetail (${insertColumns.join(", ")}) VALUES (${placeholders})`,
    values,
  );

  const [rows] = await db.execute(
    "SELECT * FROM payeedetail WHERE headid = ? AND orderid = ? ORDER BY recno DESC LIMIT 1",
    [payload.legacy_head_id, payload.order_id],
  );

  return rows[0] || null;
}
