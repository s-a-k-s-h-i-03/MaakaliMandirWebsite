export async function createOrder(payload) {
  return {
    provider: "razorpay",
    orderId: payload.orderId,
    amount: payload.amount,
    currency: "INR",
    metadata: {
      keyIdConfigured: Boolean(process.env.RAZORPAY_KEY_ID),
      message: "Razorpay integration placeholder ready. Wire SDK credentials in production.",
    },
  };
}

export async function verifyPayment(payload) {
  return {
    verified: Boolean(payload.razorpay_payment_id),
    payment_status: payload.razorpay_payment_id ? "Success" : "Failed",
    payment_id: payload.razorpay_payment_id || null,
    transaction_id: payload.razorpay_payment_id || null,
    gateway_response: payload,
  };
}
