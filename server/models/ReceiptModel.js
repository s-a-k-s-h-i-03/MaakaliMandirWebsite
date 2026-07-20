import db from "../config/db.js";
import { ensureDonationSchema } from "./DonationModel.js";

export async function findReceiptByDonationId(id) {
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
        d.amount,
        d.payment_method,
        d.payment_status,
        d.gateway,
        d.message,
        d.receipt_path,
        d.created_at,
        h.name AS donation_head
      FROM donations d
      INNER JOIN donation_heads h ON h.id = d.head_id
      WHERE d.id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

export async function updateReceiptPath(id, receiptPath) {
  await ensureDonationSchema();
  const [result] = await db.execute(
    "UPDATE donations SET receipt_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [receiptPath, id],
  );

  return result.affectedRows > 0;
}
