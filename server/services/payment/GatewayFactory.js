import * as mockPaymentService from "./mockPaymentService.js";
import * as razorpayService from "./razorpayService.js";

export function getPaymentGateway(provider = process.env.PAYMENT_PROVIDER || "mock") {
  switch (String(provider).toLowerCase()) {
    case "razorpay":
      return razorpayService;
    case "mock":
    default:
      return mockPaymentService;
  }
}
