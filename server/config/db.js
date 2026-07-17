import crypto from "crypto";
import { env } from "./env.js";

function normalizeSql(sql) {
  return String(sql).replace(/\r\n/g, "\n").trim();
}

function assertSafeIdentifier(name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Unsafe database identifier: ${name}`);
  }

  return name;
}

function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function createStatementName(sql) {
  return `stmt_${crypto.createHash("sha1").update(normalizeSql(sql)).digest("hex").slice(0, 16)}`;
}

function normalizePgMeta(result) {
  const firstRow = result.rows[0] || {};
  return {
    affectedRows: result.rowCount || 0,
    insertId: firstRow.id ?? null,
    rowCount: result.rowCount || 0,
  };
}

function returnsRows(sql) {
  const normalized = normalizeSql(sql).toLowerCase();
  return normalized.startsWith("select")
    || normalized.startsWith("show")
    || normalized.startsWith("with")
    || (normalized.startsWith("insert") && normalized.includes(" returning "));
}

class MysqlAdapter {
  constructor() {
    this.dialect = "mysql";
    this.isPostgres = false;
    this.isMysql = true;
    this.poolPromise = null;
  }

  async getPool() {
    if (!this.poolPromise) {
      this.poolPromise = (async () => {
        const mysql = await import("mysql2/promise");
        const pool = mysql.default.createPool({
          host: env.dbHost,
          port: env.dbPort,
          user: env.dbUser,
          password: env.dbPassword,
          database: env.dbName,
          charset: "utf8mb4",
          waitForConnections: true,
          connectionLimit: env.dbPoolMax,
          queueLimit: 0,
        });

        const originalGetConnection = pool.getConnection.bind(pool);

        pool.getConnection = async function getUtf8Connection() {
          const connection = await originalGetConnection();
          await connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
          await connection.query("SET CHARACTER SET utf8mb4");
          return connection;
        };

        return pool;
      })();
    }

    return this.poolPromise;
  }

  async query(sql, params = []) {
    const pool = await this.getPool();
    return pool.query(normalizeSql(sql), params);
  }

  async execute(sql, params = []) {
    const pool = await this.getPool();
    return pool.execute(normalizeSql(sql), params);
  }

  async getColumns(tableName) {
    const table = assertSafeIdentifier(tableName);
    const [rows] = await this.query(`SHOW COLUMNS FROM ${table}`);
    return new Set(rows.map((row) => row.Field));
  }

  async ping() {
    await this.query("SELECT 1 AS ok");
    return { ok: true, dialect: this.dialect };
  }
}

class PostgresAdapter {
  constructor() {
    this.dialect = "postgres";
    this.isPostgres = true;
    this.isMysql = false;
    this.poolPromise = null;
    this.retryableCodes = new Set([
      "40001",
      "53300",
      "57P01",
      "57P02",
      "57P03",
      "ECONNRESET",
      "ETIMEDOUT",
      "EPIPE",
    ]);
  }

  async getPool() {
    if (!this.poolPromise) {
      this.poolPromise = (async () => {
        const { Pool } = await import("pg");
        const pool = new Pool({
          connectionString: env.databaseUrl || undefined,
          host: env.databaseUrl ? undefined : env.dbHost,
          port: env.databaseUrl ? undefined : env.dbPort,
          user: env.databaseUrl ? undefined : env.dbUser,
          password: env.databaseUrl ? undefined : env.dbPassword,
          database: env.databaseUrl ? undefined : env.dbName,
          ssl: env.dbSsl ? { rejectUnauthorized: env.dbSslRejectUnauthorized } : false,
          max: env.dbPoolMax,
          min: env.dbPoolMin,
          idleTimeoutMillis: env.dbIdleTimeoutMs,
          connectionTimeoutMillis: env.dbConnectTimeoutMs,
          statement_timeout: env.dbStatementTimeoutMs,
          query_timeout: env.dbStatementTimeoutMs,
          maxUses: env.dbMaxUses,
          keepAlive: true,
          keepAliveInitialDelayMillis: env.dbKeepAliveInitialDelayMs,
          application_name: env.dbApplicationName,
        });

        pool.on("error", (error) => {
          console.error("PostgreSQL pool error", error);
        });

        return pool;
      })();
    }

    return this.poolPromise;
  }

  async run(sql, params = []) {
    const pool = await this.getPool();
    const text = convertPlaceholders(normalizeSql(sql));
    const query = {
      name: createStatementName(text),
      text,
      values: params,
    };

    let lastError;

    for (let attempt = 0; attempt <= env.dbRetryLimit; attempt += 1) {
      try {
        return await pool.query(query);
      } catch (error) {
        lastError = error;
        const errorCode = error?.code || error?.errno;
        const canRetry = attempt < env.dbRetryLimit && this.retryableCodes.has(String(errorCode));

        if (!canRetry) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
      }
    }

    throw lastError;
  }

  async query(sql, params = []) {
    const result = await this.run(sql, params);
    return [result.rows, normalizePgMeta(result)];
  }

  async execute(sql, params = []) {
    const result = await this.run(sql, params);
    const meta = normalizePgMeta(result);
    return returnsRows(sql) ? [result.rows, meta] : [meta, meta];
  }

  async getColumns(tableName) {
    const table = assertSafeIdentifier(tableName);
    const [rows] = await this.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = ?
        ORDER BY ordinal_position
      `,
      [table],
    );

    return new Set(rows.map((row) => row.column_name));
  }

  async ping() {
    await this.query("SELECT 1 AS ok");
    return { ok: true, dialect: this.dialect };
  }
}

const db = env.dbClient === "postgres" ? new PostgresAdapter() : new MysqlAdapter();

export default db;
