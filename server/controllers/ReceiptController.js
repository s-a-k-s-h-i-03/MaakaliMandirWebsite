import path from "path";
import { fileURLToPath } from "url";
import { findReceiptByDonationId } from "../models/ReceiptModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getReceipt(req, res) {
  const receipt = await findReceiptByDonationId(req.params.id);

  if (!receipt) {
    return res.status(404).json({
      success: false,
      message: "Receipt not found",
      errors: [],
    });
  }

  if (!receipt.receipt_path) {
    return res.status(404).json({
      success: false,
      message: "Receipt has not been generated yet",
      errors: [],
    });
  }

  const absolutePath = path.resolve(__dirname, `..${receipt.receipt_path}`);
  return res.sendFile(absolutePath);
}
