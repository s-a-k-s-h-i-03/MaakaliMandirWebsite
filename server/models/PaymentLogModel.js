import db from "../config/db.js";
import { ensureDonationSchema } from "./DonationModel.js";

function parseJsonValue(value) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? JSON.parse(value) : value;
}

export async function createPaymentLog(donationId, event, payload) {
  await ensureDonationSchema();
  const serializedPayload = payload ? JSON.stringify(payload) : null;

  const [resultRows, result] = await db.execute(
    db.isPostgres
      ? "INSERT INTO payment_logs (donation_id, event, payload) VALUES (?, ?, ?) RETURNING id"
      : "INSERT INTO payment_logs (donation_id, event, payload) VALUES (?, ?, ?)",
    [donationId, event, serializedPayload],
  );

  return result.insertId ?? resultRows?.[0]?.id ?? null;
}

export async function findPaymentLogsByDonationId(donationId) {
  await ensureDonationSchema();
  const [rows] = await db.execute(
    "SELECT id, donation_id, event, payload, created_at FROM payment_logs WHERE donation_id = ? ORDER BY created_at DESC",
    [donationId],
  );

  return rows.map((row) => ({
    ...row,
    payload: parseJsonValue(row.payload),
  }));
}
