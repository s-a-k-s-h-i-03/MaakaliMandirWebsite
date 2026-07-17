import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsDir = path.resolve(__dirname, "../uploads");
export const eventUploadsDir = path.resolve(uploadsDir, "events");
export const serviceUploadsDir = path.resolve(uploadsDir, "services");
export const galleryUploadsDir = path.resolve(uploadsDir, "gallery");

export function ensureUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(eventUploadsDir, { recursive: true });
  fs.mkdirSync(serviceUploadsDir, { recursive: true });
  fs.mkdirSync(galleryUploadsDir, { recursive: true });
}

export function sanitizeBaseName(filename) {
  return String(filename || "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "");
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEventImagePublicPath(filename) {
  return `/uploads/events/${filename}`;
}

export function getServiceImagePublicPath(filename) {
  return `/uploads/services/${filename}`;
}

export function getGalleryImagePublicPath(filename) {
  return `/uploads/gallery/${filename}`;
}

function resolveUploadFilePath(uploadDir, imagePath) {
  const filename = path.basename(imagePath || "");

  if (!filename) {
    return "";
  }

  return path.resolve(uploadDir, filename);
}

export function getEventImageAbsolutePath(imagePath) {
  return resolveUploadFilePath(eventUploadsDir, imagePath);
}

export function getServiceImageAbsolutePath(imagePath) {
  return resolveUploadFilePath(serviceUploadsDir, imagePath);
}

export function getGalleryImageAbsolutePath(imagePath) {
  return resolveUploadFilePath(galleryUploadsDir, imagePath);
}

export function deleteFileIfExists(filePath) {
  if (!filePath) {
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    fs.unlinkSync(filePath);
  }
}
