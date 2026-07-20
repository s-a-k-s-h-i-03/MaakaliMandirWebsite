import db from "../config/db.js";
import { getEventSchema } from "./EventModel.js";

export async function getDonationSummary() {
  const [rows] = await db.execute(`
    SELECT
      COUNT(*) AS totalDonations,
      COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN amount ELSE 0 END), 0) AS todayDonationsAmount,
      COALESCE(SUM(CASE
        WHEN EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
         AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        THEN amount ELSE 0 END), 0) AS monthlyDonationsAmount,
      COALESCE(SUM(amount), 0) AS totalDonationAmount
    FROM donations
    WHERE payment_status = 'Success'
  `);

  return rows[0] || {
    totalDonations: 0,
    todayDonationsAmount: 0,
    monthlyDonationsAmount: 0,
    totalDonationAmount: 0,
  };
}

export async function getEventSummary() {
  const { columns, eventDateColumn } = await getEventSchema();
  const activeClause = columns.has("status") ? "status = 'Active' AND" : "";
  const [rows] = await db.execute(`
    SELECT
      COUNT(*) AS totalEvents,
      SUM(CASE WHEN ${activeClause} ${eventDateColumn} >= CURRENT_DATE THEN 1 ELSE 0 END) AS upcomingEvents,
      SUM(CASE WHEN ${activeClause} ${eventDateColumn} < CURRENT_DATE THEN 1 ELSE 0 END) AS pastEvents
    FROM events
  `);

  return rows[0] || {
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
  };
}

export async function getLatestDonations(limit = 5) {
  const [rows] = await db.execute(
    `
      SELECT
        receipt_no,
        donor_name,
        address,
        amount,
        created_at
      FROM donations
      WHERE payment_status = 'Success'
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [limit],
  );

  return rows;
}

export async function getLatestEvents(limit = 5) {
  const { columns, eventDateColumn } = await getEventSchema();
  const [rows] = await db.execute(
    `
      SELECT
        id,
        title,
        description,
        ${columns.has("image") ? "image" : "'' AS image"},
        ${eventDateColumn} AS event_date,
        ${eventDateColumn} AS date,
        ${columns.has("location") ? "location" : "'' AS location"},
        ${columns.has("status") ? "status" : "'Active' AS status"},
        ${columns.has("created_at") ? "created_at" : "NULL AS created_at"},
        ${columns.has("updated_at") ? "updated_at" : "NULL AS updated_at"}
      FROM events
      ORDER BY ${eventDateColumn} DESC, created_at DESC
      LIMIT ?
    `,
    [limit],
  );

  return rows;
}

export async function getNavratriSummary() {
  const [rows] = await db.execute(`
    SELECT
      SUM(CASE WHEN headid = '001' THEN 1 ELSE 0 END) AS telCount,
      SUM(CASE WHEN headid = '002' THEN 1 ELSE 0 END) AS ghritCount,
      SUM(CASE WHEN headid = '003' THEN 1 ELSE 0 END) AS jawaraCount,
      COUNT(*) AS totalRegistrations
    FROM payeedetail
    WHERE headid IN ('001', '002', '003')
  `);

  return rows[0] || {
    telCount: 0,
    ghritCount: 0,
    jawaraCount: 0,
    totalRegistrations: 0,
  };
}
