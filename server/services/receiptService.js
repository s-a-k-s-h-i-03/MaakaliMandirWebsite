import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const receiptsDir = path.resolve(__dirname, "../uploads/receipts");

function ensureReceiptsDir() {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

export function generateReceiptHtml(donation) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Temple Donation Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #222; }
          .shell { max-width: 760px; margin: 0 auto; border: 1px solid #e5d7bb; border-radius: 18px; padding: 32px; }
          .brand { text-align: center; margin-bottom: 24px; }
          .brand h1 { color: #7a1c1c; margin: 0 0 8px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 24px; }
          .cell { padding: 14px; background: #fff8ea; border-radius: 12px; }
          .label { font-size: 12px; color: #7a1c1c; text-transform: uppercase; font-weight: bold; }
          .value { margin-top: 8px; font-size: 16px; }
          .footer { margin-top: 32px; font-size: 13px; color: #666; text-align: center; }
          .qr { margin-top: 24px; padding: 16px; border: 1px dashed #d9b87c; border-radius: 12px; text-align: center; color: #8a6a3e; }
        </style>
      </head>
      <body>
        <div class="shell">
          <div class="brand">
            <h1>Shri Shri Maa Adishaktipith Kali Mandir</h1>
            <p>Temple Donation Receipt</p>
          </div>
          <div class="grid">
            <div class="cell"><div class="label">Receipt Number</div><div class="value">${donation.receipt_no}</div></div>
            <div class="cell"><div class="label">Date</div><div class="value">${new Date(donation.created_at).toLocaleString("en-IN")}</div></div>
            <div class="cell"><div class="label">Donor Name</div><div class="value">${donation.donor_name}</div></div>
            <div class="cell"><div class="label">Donation Head</div><div class="value">${donation.donation_head}</div></div>
            <div class="cell"><div class="label">Amount</div><div class="value">INR ${Number(donation.amount).toFixed(2)}</div></div>
            <div class="cell"><div class="label">Payment Method</div><div class="value">${donation.payment_method}</div></div>
            <div class="cell"><div class="label">Transaction ID</div><div class="value">${donation.transaction_id || "-"}</div></div>
            <div class="cell"><div class="label">Address</div><div class="value">${donation.address}</div></div>
          </div>
          <div class="qr">QR code placeholder</div>
          <div class="footer">
            Temple Address: Manas Teerth Sonkund, Pendraroad, Chhattisgarh
          </div>
        </div>
      </body>
    </html>
  `;
}

export function createReceiptFile(donation) {
  ensureReceiptsDir();
  const filename = `receipt_${donation.id}_${Date.now()}.html`;
  const absolutePath = path.resolve(receiptsDir, filename);
  fs.writeFileSync(absolutePath, generateReceiptHtml(donation), "utf8");
  return {
    absolutePath,
    publicPath: `/uploads/receipts/${filename}`,
  };
}
