import multer from "multer";
import path from "path";
import {
  ensureUploadsDir,
  eventUploadsDir,
  galleryUploadsDir,
  sanitizeBaseName,
  serviceUploadsDir,
} from "../services/uploadService.js";

ensureUploadsDir();

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function fileFilter(_req, file, cb) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const mimeType = String(file.mimetype || "").toLowerCase();

  if (!allowedExtensions.has(extension) || !mimeType.startsWith("image/")) {
    const error = new Error("Only jpg, jpeg, png, and webp image files are allowed.");
    error.statusCode = 400;
    cb(error);
    return;
  }

  cb(null, true);
}

function createStorage(destinationDir, prefix) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destinationDir);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const random = Math.random().toString(36).slice(2, 8);
      const baseName = sanitizeBaseName(path.basename(file.originalname || "", extension)).slice(0, 40) || prefix;
      cb(null, `${prefix}_${Date.now()}_${random}_${baseName}${extension}`);
    },
  });
}

function createUploader(storage, maxFileSize = 5 * 1024 * 1024) {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
    },
  });
}

export const upload = createUploader(createStorage(eventUploadsDir, "event"));
export const serviceUpload = createUploader(createStorage(serviceUploadsDir, "service"));
export const galleryUpload = createUploader(createStorage(galleryUploadsDir, "gallery"), 8 * 1024 * 1024);

export default upload;

export const serviceMulter = serviceUpload;

export const eventMulter = upload;

export const galleryMulter = galleryUpload;

export const imageUploadConfig = {
  maxFileSize: 5 * 1024 * 1024,
  galleryMaxFileSize: 8 * 1024 * 1024,
  allowedExtensions: Array.from(allowedExtensions),
};
