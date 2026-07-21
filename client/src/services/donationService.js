import axios from "axios";
import { apiBaseUrl } from "../content";
import { adminApi } from "../admin/Services/api";

const publicApi = axios.create({
  baseURL: apiBaseUrl,
});

export async function getDonationHeads() {
  const { data } = await publicApi.get("/api/donation-heads");
  return data;
}

export async function createDonation(payload) {
  const { data } = await publicApi.post("/api/donations", payload);
  return data;
}

export function getDonationReceipt(id) {
  return `${publicApi.defaults.baseURL}/api/donations/receipt/${id}`;
}

export async function fetchAdminDonations(params = {}) {
  const { data } = await adminApi.get("/api/admin/donations", { params });
  return data;
}

export async function fetchDonationStats() {
  const { data } = await adminApi.get("/api/admin/donations/stats");
  return data;
}

export async function fetchDonationById(id) {
  const { data } = await adminApi.get(`/api/admin/donations/${id}`);
  return data;
}

export async function updateDonation(id, payload) {
  const { data } = await adminApi.put(`/api/admin/donations/${id}`, payload);
  return data;
}

export async function deleteDonation(id) {
  const { data } = await adminApi.delete(`/api/admin/donations/${id}`);
  return data;
}

export async function fetchAdminDonationHeads() {
  const { data } = await adminApi.get("/api/admin/donation-heads");
  return data;
}
