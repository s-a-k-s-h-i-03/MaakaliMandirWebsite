import db from "../config/db.js";

let eventSchemaPromise;

export async function getEventSchema() {
  if (!eventSchemaPromise) {
    eventSchemaPromise = (async () => {
      const columns = await db.getColumns("events");

      const eventDateColumn = columns.has("event_date")
        ? "event_date"
        : columns.has("date")
          ? "date"
          : null;

      if (!eventDateColumn) {
        throw new Error("Events table is missing both `event_date` and `date` columns.");
      }

      return {
        columns,
        eventDateColumn,
      };
    })();
  }

  return eventSchemaPromise;
}

export async function getEventDateColumn() {
  const schema = await getEventSchema();
  return schema.eventDateColumn;
}

function selectExpression(columns, columnName, fallback, alias = columnName) {
  return columns.has(columnName)
    ? `${columnName} AS ${alias}`
    : `${fallback} AS ${alias}`;
}

async function buildBaseSelect() {
  const { columns, eventDateColumn } = await getEventSchema();

  return `
    SELECT
      id,
      title,
      description,
      ${selectExpression(columns, "image", "''")},
      ${eventDateColumn} AS event_date,
      ${eventDateColumn} AS date,
      ${selectExpression(columns, "location", "''")},
      ${selectExpression(columns, "status", "'Active'")},
      ${selectExpression(columns, "created_at", "NULL")},
      ${selectExpression(columns, "updated_at", "NULL")}
    FROM events
  `;
}

export async function findAll() {
  const baseSelect = await buildBaseSelect();
  const [rows] = await db.execute(`${baseSelect} ORDER BY event_date DESC, created_at DESC`);
  return rows;
}

export async function findActive() {
  const { columns } = await getEventSchema();
  const baseSelect = await buildBaseSelect();
  const whereClause = columns.has("status") ? "WHERE status = 'Active'" : "";
  const [rows] = await db.execute(
    `${baseSelect} ${whereClause} ORDER BY event_date DESC, created_at DESC`,
  );

  return rows;
}

export async function findById(id) {
  const baseSelect = await buildBaseSelect();
  const [rows] = await db.execute(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function create(payload) {
  const { columns, eventDateColumn } = await getEventSchema();
  const insertColumns = ["title", "description", eventDateColumn];
  const insertValues = [payload.title, payload.description, payload.event_date];

  if (columns.has("image")) {
    insertColumns.push("image");
    insertValues.push(payload.image);
  }

  if (columns.has("location")) {
    insertColumns.push("location");
    insertValues.push(payload.location);
  }

  if (columns.has("status")) {
    insertColumns.push("status");
    insertValues.push(payload.status);
  }

  const [resultRows, result] = await db.execute(
    db.isPostgres
      ? `
        INSERT INTO events (${insertColumns.join(", ")})
        VALUES (${insertColumns.map(() => "?").join(", ")})
        RETURNING id
      `
      : `
        INSERT INTO events (${insertColumns.join(", ")})
        VALUES (${insertColumns.map(() => "?").join(", ")})
      `,
    insertValues,
  );

  return findById(result.insertId ?? resultRows?.[0]?.id);
}

export async function update(id, payload) {
  const { columns, eventDateColumn } = await getEventSchema();
  const updates = [
    "title = ?",
    "description = ?",
    `${eventDateColumn} = ?`,
  ];
  const values = [
    payload.title,
    payload.description,
    payload.event_date,
  ];

  if (columns.has("image")) {
    updates.push("image = ?");
    values.push(payload.image);
  }

  if (columns.has("location")) {
    updates.push("location = ?");
    values.push(payload.location);
  }

  if (columns.has("status")) {
    updates.push("status = ?");
    values.push(payload.status);
  }

  if (columns.has("updated_at")) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
  }

  values.push(id);

  const [result] = await db.execute(
    `
      UPDATE events
      SET
        ${updates.join(",\n        ")}
      WHERE id = ?
    `,
    values,
  );

  return result.affectedRows > 0 ? findById(id) : null;
}

export async function remove(id) {
  const [result] = await db.execute("DELETE FROM events WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
