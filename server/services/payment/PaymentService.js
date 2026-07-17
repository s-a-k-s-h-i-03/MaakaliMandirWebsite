import crypto from "crypto";
import { getPaymentGateway } from "./GatewayFactory.js";

export function generateOrderId() {
  return `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function generateReceiptNo() {
  return `RCPT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createPaymentOrder(payload) {
  const gateway = getPaymentGateway();
  return gateway.createOrder(payload);
}

export async function verifyPayment(payload) {
  const gateway = getPaymentGateway(payload.provider);
  return gateway.verifyPayment(payload);
}
