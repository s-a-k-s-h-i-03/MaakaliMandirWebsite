import crypto from "crypto";

export async function createOrder(payload) {
  return {
    provider: "mock",
    orderId: payload.orderId,
    amount: payload.amount,
    currency: "INR",
    paymentUrl: `/mock-payment/${payload.orderId}`,
    metadata: {
      message: "Mock order created successfully",
    },
  };
}

export async function verifyPayment(payload) {
  const paymentId = payload.payment_id || `mockpay_${crypto.randomBytes(6).toString("hex")}`;
  const transactionId = payload.transaction_id || paymentId;
  const status = payload.status || "Success";

  return {
    verified: status === "Success",
    payment_status: status,
    payment_id: paymentId,
    transaction_id: transactionId,
    gateway_response: payload,
  };
}
