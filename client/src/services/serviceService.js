import axios from "axios";
import { apiBaseUrl } from "../content";
import { adminApi } from "../admin/Services/api";

const publicApi = axios.create({
  baseURL: apiBaseUrl,
});

export async function getServices() {
  const { data } = await publicApi.get("/api/services");
  return data;
}

export async function getServiceBySlug(slug) {
  const { data } = await publicApi.get(`/api/services/${slug}`);
  return data.data;
}

function createServiceFormData(payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("slug", payload.slug);
  formData.append("short_description", payload.short_description);
  formData.append("description", payload.description);
  formData.append("icon", payload.icon);
  formData.append("display_order", String(payload.display_order));
  formData.append("status", payload.status);

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return formData;
}

export async function getAdminServices() {
  const { data } = await adminApi.get("/api/admin/services");
  return data.data;
}

export async function getAdminService(id) {
  const { data } = await adminApi.get(`/api/admin/services/${id}`);
  return data.data;
}

export async function createService(payload) {
  const { data } = await adminApi.post("/api/admin/services", createServiceFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateService(id, payload) {
  const { data } = await adminApi.put(`/api/admin/services/${id}`, createServiceFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteService(id) {
  const { data } = await adminApi.delete(`/api/admin/services/${id}`);
  return data;
}
