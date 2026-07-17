import axios from "axios";
import { apiBaseUrl } from "../../content";
import { clearStoredToken, getStoredToken, isTokenExpired } from "../Utils/auth";

export const adminApi = axios.create({
  baseURL: apiBaseUrl || "http://localhost:5000",
});

adminApi.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    if (isTokenExpired(token)) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent("admin:logout", { detail: { reason: "expired" } }));
      return Promise.reject(new Error("Session expired"));
    }

    config.headers.Authorization = token;
  }

  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent("admin:logout", { detail: { reason: "unauthorized" } }));
    }

    return Promise.reject(error);
  },
);

export async function loginAdmin(payload) {
  const { data } = await adminApi.post("/api/admin/login", payload);
  return data;
}

export async function fetchDashboardStats() {
  const { data } = await adminApi.get("/api/admin/dashboard/stats");
  return data;
}

export async function fetchDonations() {
  const { data } = await adminApi.get("/api/admin/donations");
  return data;
}

export async function fetchEvents() {
  const { data } = await adminApi.get("/api/admin/events");
  return data;
}

export function getExportUrl(path) {
  return `${adminApi.defaults.baseURL}${path}`;
}

export async function downloadAdminFile(path, filename) {
  const response = await adminApi.get(path, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
}
