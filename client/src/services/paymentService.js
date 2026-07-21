import axios from "axios";
import { apiBaseUrl } from "../content";

const publicApi = axios.create({
  baseURL: apiBaseUrl,
});

export async function createPaymentOrder(payload) {
  const { data } = await publicApi.post("/api/payments/create-order", payload);
  return data;
}

export async function verifyPayment(payload) {
  const { data } = await publicApi.post("/api/payments/verify", payload);
  return data;
}
