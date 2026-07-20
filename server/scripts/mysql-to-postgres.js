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
const rootDir = path.resolve(__dirname, "..");
const logsDir = path.resolve(rootDir, "logs");
const reportPath = path.resolve(logsDir, `mysql-to-postgres-${new Date().toISOString().replace(/[:.]/g, "-")}.log`);

fs.mkdirSync(logsDir, { recursive: true });

const sourceConfig = {
  host: process.env.MYSQL_HOST || process.env.SOURCE_MYSQL_HOST || process.env.DB_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || process.env.SOURCE_MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || process.env.SOURCE_MYSQL_USER || process.env.DB_USER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.SOURCE_MYSQL_PASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || process.env.SOURCE_MYSQL_DATABASE || process.env.DB_NAME || "",
  waitForConnections: true,
  connectionLimit: Number(process.env.MIGRATION_MYSQL_POOL_MAX || 5),
  charset: "utf8mb4",
};

const targetConfig = {
  connectionString: process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL || "",
  host: process.env.PGHOST || process.env.TARGET_PG_HOST || undefined,
  port: Number(process.env.PGPORT || process.env.TARGET_PG_PORT || 5432),
  user: process.env.PGUSER || process.env.TARGET_PG_USER || undefined,
  password: process.env.PGPASSWORD || process.env.TARGET_PG_PASSWORD || undefined,
  database: process.env.PGDATABASE || process.env.TARGET_PG_DATABASE || undefined,
  ssl: String(process.env.TARGET_PG_SSL || process.env.DB_SSL || "").toLowerCase() === "true"
    ? { rejectUnauthorized: String(process.env.TARGET_PG_SSL_REJECT_UNAUTHORIZED || process.env.DB_SSL_REJECT_UNAUTHORIZED || "true").toLowerCase() !== "false" }
    : false,
  max: Number(process.env.MIGRATION_PG_POOL_MAX || 5),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
};

const preferredOrder = [
  "admin_users",
  "donation_heads",
  "donations",
  "payment_logs",
  "events",
  "gallery",
  "services",
  "payeedetail",
];

const schemaVerificationRequiredTables = new Set(["admin_users", "payeedetail"]);

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  fs.appendFileSync(reportPath, `${line}\n`);
  console.log(line);
}

function quoteIdentifier(name) {
  return `"${String(name).replace(/"/g, "\"\"")}"`;
}

function isPlaceholderTableAllowed(table) {
  return !schemaVerificationRequiredTables.has(table)
    || String(process.env.ALLOW_PLACEHOLDER_TABLE_MIGRATION || "").toLowerCase() === "true";
}

function chunk(items, size) {
  const output = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
}

async function withRetry(label, task, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      log(`${label} failed on attempt ${attempt}/${retries}: ${error.message}`);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  throw lastError;
}

async function getMysqlTables(mysqlPool) {
  const [rows] = await mysqlPool.query(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ?
        AND table_type = 'BASE TABLE'
    `,
    [sourceConfig.database],
  );

  const tables = rows.map((row) => row.TABLE_NAME);
  const preferred = preferredOrder.filter((table) => tables.includes(table));
  const extra = tables.filter((table) => !preferred.includes(table)).sort();
  return [...preferred, ...extra];
}

async function getMysqlColumns(mysqlPool, table) {
  const [rows] = await mysqlPool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = ?
        AND table_name = ?
      ORDER BY ordinal_position
    `,
    [sourceConfig.database, table],
  );

  return rows.map((row) => row.COLUMN_NAME);
}

async function getPostgresColumns(pgPool, table) {
  const { rows } = await pgPool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [table],
  );

  return rows.map((row) => row.column_name);
}

async function getPrimaryKeys(pgPool, table) {
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

async function getMysqlColumnDetails(mysqlPool, table) {
  const [rows] = await mysqlPool.query(
    `
      SELECT column_name, data_type, is_nullable, column_key, extra
      FROM information_schema.columns
      WHERE table_schema = ?
        AND table_name = ?
      ORDER BY ordinal_position
    `,
    [sourceConfig.database, table],
  );

  return rows;
}

async function getPostgresColumnDetails(pgPool, table) {
  const { rows } = await pgPool.query(
    `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [table],
  );

  return rows;
}

async function verifySchemaCompatibility(mysqlPool, pgPool, table) {
  const mysqlColumns = await getMysqlColumnDetails(mysqlPool, table);
  const pgColumns = await getPostgresColumnDetails(pgPool, table);
  const mysqlNames = new Set(mysqlColumns.map((row) => row.COLUMN_NAME || row.column_name));
  const pgNames = new Set(pgColumns.map((row) => row.column_name));
  const missingInTarget = [...mysqlNames].filter((column) => !pgNames.has(column));

  if (missingInTarget.length > 0 && schemaVerificationRequiredTables.has(table)) {
    throw new Error(
      `${table} is missing target columns: ${missingInTarget.join(", ")}. `
      + "Confirm the live schema before migrating this placeholder-backed table.",
    );
  }
}

function normalizeValue(value) {
  if (Buffer.isBuffer(value)) {
    return value.toString("utf8");
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return value;
}

async function copyTable(mysqlPool, pgPool, table) {
  if (!isPlaceholderTableAllowed(table)) {
    throw new Error(
      `${table} requires live schema confirmation. `
      + "Set ALLOW_PLACEHOLDER_TABLE_MIGRATION=true only after verifying the production schema.",
    );
  }

  await verifySchemaCompatibility(mysqlPool, pgPool, table);

  const mysqlColumns = await getMysqlColumns(mysqlPool, table);
  const pgColumns = await getPostgresColumns(pgPool, table);
  const commonColumns = mysqlColumns.filter((column) => pgColumns.includes(column));

  if (commonColumns.length === 0) {
    throw new Error(`No shared columns found for ${table}`);
  }

  const primaryKeys = await getPrimaryKeys(pgPool, table);
  if (primaryKeys.length === 0) {
    throw new Error(`Table ${table} has no PostgreSQL primary key. Manual migration required.`);
  }

  const mysqlSelect = `SELECT ${commonColumns.map((column) => `\`${column}\``).join(", ")} FROM \`${table}\``;
  const [rows] = await mysqlPool.query(mysqlSelect);

  if (rows.length === 0) {
    log(`${table}: no rows to migrate`);
    return { table, sourceCount: 0, targetCount: 0, skipped: false };
  }

  const columnSql = commonColumns.map(quoteIdentifier).join(", ");
  const conflictSql = primaryKeys.map(quoteIdentifier).join(", ");
  const updateColumns = commonColumns.filter((column) => !primaryKeys.includes(column));
  const updateSql = updateColumns.length > 0
    ? `DO UPDATE SET ${updateColumns.map((column) => `${quoteIdentifier(column)} = EXCLUDED.${quoteIdentifier(column)}`).join(", ")}`
    : "DO NOTHING";

  for (const batch of chunk(rows, Number(process.env.MIGRATION_BATCH_SIZE || 250))) {
    const values = [];
    const placeholders = batch.map((row, rowIndex) => {
      const rowValues = commonColumns.map((column) => normalizeValue(row[column]));
      values.push(...rowValues);
      const tuple = rowValues.map((_, columnIndex) => `$${rowIndex * commonColumns.length + columnIndex + 1}`);
      return `(${tuple.join(", ")})`;
    });

    const insertSql = `
      INSERT INTO ${quoteIdentifier(table)} (${columnSql})
      VALUES ${placeholders.join(", ")}
      ON CONFLICT (${conflictSql}) ${updateSql}
    `;

    await withRetry(`copy ${table} batch`, async () => {
      await pgPool.query(insertSql, values);
    });
  }

  const [{ sourceCount }] = (await mysqlPool.query(`SELECT COUNT(*) AS sourceCount FROM \`${table}\``))[0];
  const { rows: targetRows } = await pgPool.query(`SELECT COUNT(*)::int AS "targetCount" FROM ${quoteIdentifier(table)}`);
  const targetCount = targetRows[0]?.targetCount ?? 0;

  if (Number(sourceCount) !== Number(targetCount)) {
    throw new Error(`${table} row count mismatch: MySQL=${sourceCount}, PostgreSQL=${targetCount}`);
  }

  return { table, sourceCount: Number(sourceCount), targetCount: Number(targetCount), skipped: false };
}

async function resetSequences(pgPool) {
  const { rows } = await pgPool.query(`
    SELECT
      table_name,
      column_name,
      pg_get_serial_sequence(format('%I', table_name), column_name) AS sequence_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND column_default LIKE 'nextval%'
  `);

  for (const row of rows) {
    if (!row.sequence_name) {
      continue;
    }

    await pgPool.query(
      `
        SELECT setval(
          $1,
          COALESCE((SELECT MAX(${quoteIdentifier(row.column_name)}) FROM ${quoteIdentifier(row.table_name)}), 0),
          true
        )
      `,
      [row.sequence_name],
    );
  }
}

async function main() {
  if (!sourceConfig.database) {
    throw new Error("Missing MySQL source database name.");
  }

  if (!targetConfig.connectionString && !targetConfig.host) {
    throw new Error("Missing PostgreSQL target configuration.");
  }

  const mysqlPool = mysql.createPool(sourceConfig);
  const pgPool = new Pool(targetConfig);

  try {
    log(`Migration log: ${reportPath}`);
    const tables = await getMysqlTables(mysqlPool);
    log(`Discovered tables: ${tables.join(", ")}`);

    const results = [];
    for (const table of tables) {
      log(`Migrating ${table}`);
      try {
        const result = await copyTable(mysqlPool, pgPool, table);
        results.push(result);
        log(`${table} complete: ${result.sourceCount} rows`);
      } catch (error) {
        if (schemaVerificationRequiredTables.has(table)) {
          log(`Skipped ${table}: ${error.message}`);
          results.push({ table, skipped: true, sourceCount: 0, targetCount: 0 });
          continue;
        }

        throw error;
      }
    }

    await resetSequences(pgPool);
    log("PostgreSQL sequences synchronized");

    const summary = results.map((result) => `${result.table}: ${result.skipped ? "skipped" : result.sourceCount}`).join("; ");
    log(`Migration completed successfully. ${summary}`);
  } finally {
    await mysqlPool.end();
    await pgPool.end();
  }
}

main().catch((error) => {
  log(`Migration failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
