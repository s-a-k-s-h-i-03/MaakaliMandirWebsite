import axios from "axios";
import { apiBaseUrl } from "../../content";
import { adminApi } from "./api";

const publicApi = axios.create({
  baseURL: apiBaseUrl || "http://localhost:5000",
});

function createFormData(payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("event_date", payload.event_date);
  formData.append("location", payload.location);
  formData.append("status", payload.status);

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  return formData;
}

export async function getEvents() {
  const { data } = await publicApi.get("/api/events");
  return data;
}

export async function getAdminEvents() {
  const { data } = await adminApi.get("/api/admin/events");
  return data;
}

export async function getEvent(id) {
  const { data } = await adminApi.get(`/api/admin/events/${id}`);
  return data.data;
}

export async function createEvent(payload, onUploadProgress) {
  const { data } = await adminApi.post("/api/admin/events", createFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return data;
}

export async function updateEvent(id, payload, onUploadProgress) {
  const { data } = await adminApi.put(`/api/admin/events/${id}`, createFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return data;
}

export async function deleteEvent(id) {
  const { data } = await adminApi.delete(`/api/admin/events/${id}`);
  return data;
}
