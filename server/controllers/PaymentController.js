import { findDonationById, findDonationByOrderId, updateDonationStatus } from "../models/DonationModel.js";
import { createPaymentLog } from "../models/PaymentLogModel.js";
import { createPaymentOrder, verifyPayment as verifyGatewayPayment } from "../services/payment/PaymentService.js";
import { createReceiptFile } from "../services/receiptService.js";
import { updateReceiptPath } from "../models/ReceiptModel.js";
import { sendDonationReceiptEmail } from "../services/emailService.js";

export async function createOrder(req, res) {
  const donationId = Number(req.body?.donation_id);
  const donation = await findDonationById(donationId);

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: "Donation not found",
      errors: [],
    });
  }

  const order = await createPaymentOrder({
    orderId: donation.order_id,
    amount: donation.amount,
    donationId: donation.id,
  });

  await createPaymentLog(donation.id, "order_created", order);

  return res.json({
    success: true,
    message: "Payment order created successfully",
    data: order,
  });
}

export async function verifyPayment(req, res) {
  const orderId = String(req.body?.order_id || "").trim();

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["order_id is required."],
    });
  }

  const donation = await findDonationByOrderId(orderId);

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: "Donation not found",
      errors: [],
    });
  }

  const verification = await verifyGatewayPayment(req.body);
  const updatedDonation = await updateDonationStatus(donation.id, {
    payment_status: verification.payment_status,
    transaction_id: verification.transaction_id,
    gateway: donation.gateway,
    gateway_response: verification.gateway_response,
  });

  await createPaymentLog(donation.id, "payment_verified", verification);

  let receipt = null;

  if (verification.payment_status === "Success" && updatedDonation) {
    receipt = createReceiptFile(updatedDonation);
    await updateReceiptPath(updatedDonation.id, receipt.publicPath);
    await createPaymentLog(updatedDonation.id, "receipt_generated", receipt);
    await sendDonationReceiptEmail({ donation: updatedDonation });
  }

  return res.json({
    success: verification.verified,
    message: verification.payment_status === "Success"
      ? "Payment verified successfully"
      : "Payment verification completed",
    data: {
      donation: updatedDonation,
      receipt,
      verification,
    },
  });
}
