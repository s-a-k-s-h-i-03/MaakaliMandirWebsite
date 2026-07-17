import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  dbClient: (process.env.DB_CLIENT || "postgres").trim().toLowerCase(),
  databaseUrl: process.env.DATABASE_URL || "",
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT || ((process.env.DB_CLIENT || "postgres") === "postgres" ? 5432 : 3306)),
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "maakalisonkundgpm",
  dbSsl: String(process.env.DB_SSL || "").trim().toLowerCase() === "true",
  dbSslRejectUnauthorized: String(process.env.DB_SSL_REJECT_UNAUTHORIZED || "true").trim().toLowerCase() !== "false",
  dbPoolMin: Number(process.env.DB_POOL_MIN || 0),
  dbPoolMax: Number(process.env.DB_POOL_MAX || 10),
  dbIdleTimeoutMs: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  dbConnectTimeoutMs: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
  dbStatementTimeoutMs: Number(process.env.DB_STATEMENT_TIMEOUT_MS || 15000),
  dbMaxUses: Number(process.env.DB_MAX_USES || 7500),
  dbKeepAliveInitialDelayMs: Number(process.env.DB_KEEPALIVE_INITIAL_DELAY_MS || 10000),
  dbApplicationName: process.env.DB_APPLICATION_NAME || "maakalisonkund-server",
  dbRetryLimit: Number(process.env.DB_RETRY_LIMIT || 2),
  jwtSecret: process.env.JWT_SECRET || "secret123",
};
