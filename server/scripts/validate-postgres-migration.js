import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import pg from "pg";

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const outputPath = path.resolve(rootDir, "DATA_VALIDATION_REPORT.md");

const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.SOURCE_MYSQL_HOST || process.env.DB_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || process.env.SOURCE_MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.SOURCE_MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.SOURCE_MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || process.env.SOURCE_MYSQL_DATABASE || process.env.DB_NAME || "",
});

const pgPool = new Pool({
  connectionString: process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || process.env.TARGET_PG_HOST || undefined,
  port: Number(process.env.PGPORT || process.env.TARGET_PG_PORT || 5432),
  user: process.env.PGUSER || process.env.TARGET_PG_USER || undefined,
  password: process.env.PGPASSWORD || process.env.TARGET_PG_PASSWORD || undefined,
  database: process.env.PGDATABASE || process.env.TARGET_PG_DATABASE || undefined,
  ssl: String(process.env.TARGET_PG_SSL || process.env.DB_SSL || "").toLowerCase() === "true"
    ? { rejectUnauthorized: String(process.env.TARGET_PG_SSL_REJECT_UNAUTHORIZED || process.env.DB_SSL_REJECT_UNAUTHORIZED || "true").toLowerCase() !== "false" }
    : false,
});

const schemaVerificationRequiredTables = new Set(["admin_users", "payeedetail"]);

async function getTables() {
  const [rows] = await mysqlPool.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ?
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `,
    [process.env.MYSQL_DATABASE || process.env.SOURCE_MYSQL_DATABASE || process.env.DB_NAME || ""],
  );

  return rows.map((row) => row.TABLE_NAME);
}

async function getCount(pool, sql, params = []) {
  const result = await pool.query(sql, params);
  const rows = Array.isArray(result[0]) ? result[0] : result.rows;
  const value = rows[0] && Object.values(rows[0])[0];
  return Number(value || 0);
}

async function compareTable(table) {
  const mysqlCount = await getCount(mysqlPool, `SELECT COUNT(*) AS total FROM \`${table}\``);
  const pgCount = await getCount(pgPool, `SELECT COUNT(*)::int AS total FROM "${table}"`);
  return { table, mysqlCount, pgCount, match: mysqlCount === pgCount };
}

async function getPostgresPrimaryKeyColumns(table) {
  const { rows } = await pgPool.query(
    `
      SELECT a.attname AS column_name
      FROM pg_index i
      JOIN pg_attribute a
        ON a.attrelid = i.indrelid
       AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass
        AND i.indisprimary
      ORDER BY array_position(i.indkey, a.attnum)
    `,
    [table],
  );

  return rows.map((row) => row.column_name);
}

async function getPostgresIndexCount(table) {
  const { rows } = await pgPool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM pg_indexes
      WHERE schemaname = current_schema()
        AND tablename = $1
    `,
    [table],
  );

  return rows[0]?.total ?? 0;
}

async function getPostgresSequenceState(table, idColumn = "id") {
  const { rows } = await pgPool.query(
    `
      SELECT pg_get_serial_sequence($1, $2) AS sequence_name
    `,
    [table, idColumn],
  );

  const sequenceName = rows[0]?.sequence_name;
  if (!sequenceName) {
    return null;
  }

  const [{ max_id: maxId } = { max_id: 0 }] = (await pgPool.query(`SELECT COALESCE(MAX("${idColumn}"), 0) AS max_id FROM "${table}"`)).rows;
  const sequenceState = (await pgPool.query(`SELECT last_value, is_called FROM ${sequenceName}`)).rows[0];

  return {
    sequenceName,
    maxId: Number(maxId || 0),
    lastValue: Number(sequenceState?.last_value || 0),
    isCalled: Boolean(sequenceState?.is_called),
  };
}

async function main() {
  const tables = await getTables();
  const comparisons = [];

  for (const table of tables) {
    const comparison = await compareTable(table);
    const primaryKeys = await getPostgresPrimaryKeyColumns(table);
    const indexCount = await getPostgresIndexCount(table);
    const sequence = await getPostgresSequenceState(table);
    comparisons.push({
      ...comparison,
      primaryKeys,
      indexCount,
      sequence,
      requiresSchemaConfirmation: schemaVerificationRequiredTables.has(table),
    });
  }

  const lines = [
    "# Data Validation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "| Table | MySQL Rows | PostgreSQL Rows | Match |",
    "| --- | ---: | ---: | --- |",
    ...comparisons.map((row) => `| ${row.table} | ${row.mysqlCount} | ${row.pgCount} | ${row.match ? "Yes" : "No"} |`),
    "",
    "## Structural checks",
    "",
    "| Table | Primary Key Columns | Index Count | Sequence State | Notes |",
    "| --- | --- | ---: | --- | --- |",
    ...comparisons.map((row) => {
      const sequence = row.sequence
        ? `${row.sequence.lastValue} (max id ${row.sequence.maxId})`
        : "n/a";
      const notes = row.requiresSchemaConfirmation
        ? "Requires live schema confirmation"
        : "";
      return `| ${row.table} | ${row.primaryKeys.join(", ") || "n/a"} | ${row.indexCount} | ${sequence} | ${notes} |`;
    }),
    "",
    "## Notes",
    "",
    "- This report validates table row counts only.",
    "- Primary key columns, PostgreSQL index counts, and sequence positions are included for quick review.",
    "- NULL distribution and foreign key integrity still require live database inspection.",
    "- If any table shows `No`, stop cutover and investigate before production use.",
  ];

  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
  console.log(`Wrote ${outputPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mysqlPool.end();
    await pgPool.end();
  });
