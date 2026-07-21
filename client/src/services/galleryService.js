import axios from "axios";
import { apiBaseUrl } from "../content";
import { adminApi } from "../admin/Services/api";

export const galleryCategories = [
  "All",
  "Temple",
  "Festival",
  "Navratri",
  "Puja",
  "Events",
  "Construction",
  "Other",
];

const publicApi = axios.create({
  baseURL: apiBaseUrl,
});

function appendMaybeArray(formData, key, value) {
  if (Array.isArray(value)) {
    value.forEach((item) => formData.append(key, item));
    return;
  }

  if (value !== undefined && value !== null) {
    formData.append(key, value);
  }
}

function createGalleryFormData(payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("category", payload.category);
  formData.append("display_order", String(payload.display_order));
  formData.append("featured", payload.featured ? "true" : "false");
  formData.append("status", payload.status);

  const images = Array.isArray(payload.images)
    ? payload.images
    : payload.images
      ? [payload.images]
      : [];

  images.forEach((image) => {
    if (image instanceof File) {
      formData.append("images", image);
    }
  });

  appendMaybeArray(formData, "existingImages", payload.existingImages || []);

  return formData;
}

export async function getGallery(params = {}) {
  const { data } = await publicApi.get("/api/gallery", { params });
  return data.data;
}

export async function getGalleryItem(id) {
  const { data } = await publicApi.get(`/api/gallery/${id}`);
  return data.data;
}

export async function getGalleryByCategory(category) {
  const { data } = await publicApi.get(`/api/gallery/category/${category}`);
  return data.data;
}

export async function getAdminGallery() {
  const { data } = await adminApi.get("/api/admin/gallery");
  return data.data;
}

export async function getAdminGalleryItem(id) {
  const { data } = await adminApi.get(`/api/admin/gallery/${id}`);
  return data.data;
}

export async function createGallery(payload, onUploadProgress) {
  const { data } = await adminApi.post("/api/admin/gallery", createGalleryFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
}

export async function updateGallery(id, payload, onUploadProgress) {
  const { data } = await adminApi.put(`/api/admin/gallery/${id}`, createGalleryFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
}

export async function deleteGallery(id) {
  const { data } = await adminApi.delete(`/api/admin/gallery/${id}`);
  return data;
}
