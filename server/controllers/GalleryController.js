import {
  create as createGalleryRecord,
  findActive,
  findAll,
  findById,
  findCategory,
  findFeatured,
  remove as removeGalleryRecord,
  update as updateGalleryRecord,
} from "../models/GalleryModel.js";
import {
  deleteFileIfExists,
  getGalleryImageAbsolutePath,
  getGalleryImagePublicPath,
  sanitizeBaseName,
} from "../services/uploadService.js";

const allowedCategories = new Set([
  "Temple",
  "Festival",
  "Navratri",
  "Puja",
  "Events",
  "Construction",
  "Other",
]);

function toBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

function normalizePayload(body) {
  return {
    title: String(body?.title || "").trim(),
    description: String(body?.description || "").trim(),
    category: String(body?.category || "Other").trim() || "Other",
    display_order: Number(body?.display_order || 0),
    featured: toBool(body?.featured),
    status: String(body?.status || "Active").trim() || "Active",
  };
}

function validatePayload(payload, { requireImage = false } = {}) {
  const errors = {};

  if (!payload.title) {
    errors.title = "Title is required.";
  }

  if (!allowedCategories.has(payload.category)) {
    errors.category = "Invalid category.";
  }

  if (!["Active", "Inactive"].includes(payload.status)) {
    errors.status = "Status must be Active or Inactive.";
  }

  if (!Number.isFinite(payload.display_order) || payload.display_order < 0) {
    errors.display_order = "Display order must be zero or greater.";
  }

  if (requireImage) {
    errors.image = "At least one image is required.";
  }

  return errors;
}

function cleanupFiles(files) {
  for (const file of files || []) {
    deleteFileIfExists(file.path);
  }
}

function formatSuccess(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function formatFailure(res, statusCode, message, errors = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

function mapCreatePayload(payload, file, index) {
  const fallbackTitle = sanitizeBaseName(file.originalname || `gallery-${Date.now()}`);
  return {
    ...payload,
    title:
      index === 0 || !payload.title
        ? payload.title || fallbackTitle
        : `${payload.title} ${index + 1}`,
    image: getGalleryImagePublicPath(file.filename),
  };
}

export async function getGallery(req, res) {
  const category = String(req.query.category || "").trim();
  const featured = String(req.query.featured || "").trim().toLowerCase();

  if (category) {
    const rows = await findCategory(category);
    return formatSuccess(res, "Gallery fetched successfully", rows);
  }

  if (featured === "true" || featured === "1") {
    const rows = await findFeatured();
    return formatSuccess(res, "Featured gallery fetched successfully", rows);
  }

  const rows = await findActive();
  return formatSuccess(res, "Gallery fetched successfully", rows);
}

export async function getGalleryItem(req, res) {
  const item = await findById(req.params.id);

  if (!item || item.status !== "Active") {
    return formatFailure(res, 404, "Gallery item not found", []);
  }

  return formatSuccess(res, "Gallery item fetched successfully", item);
}

export async function getCategory(req, res) {
  const category = String(req.params.category || "").trim();

  if (!allowedCategories.has(category)) {
    return formatFailure(res, 400, "Invalid category", []);
  }

  const rows = await findCategory(category);
  return formatSuccess(res, "Gallery category fetched successfully", rows);
}

export async function getAdminGallery(_req, res) {
  const rows = await findAll();
  return formatSuccess(res, "Gallery fetched successfully", rows);
}

export async function getAdminGalleryItem(req, res) {
  const item = await findById(req.params.id);

  if (!item) {
    return formatFailure(res, 404, "Gallery item not found", []);
  }

  return formatSuccess(res, "Gallery item fetched successfully", item);
}

export async function createGallery(req, res) {
  const files = req.files || [];
  const payload = normalizePayload(req.body);
  const errors = validatePayload(payload, { requireImage: files.length === 0 });

  if (Object.keys(errors).length > 0) {
    cleanupFiles(files);
    return formatFailure(res, 400, "Validation failed", errors);
  }

  const createdItems = [];

  for (const [index, file] of files.entries()) {
    const row = await createGalleryRecord(mapCreatePayload(payload, file, index));
    createdItems.push(row);
  }

  return formatSuccess(
    res,
    createdItems.length > 1 ? "Gallery items created successfully" : "Gallery item created successfully",
    createdItems.length === 1 ? createdItems[0] : createdItems,
    201,
  );
}

export async function updateGallery(req, res) {
  const existing = await findById(req.params.id);

  if (!existing) {
    cleanupFiles(req.files);
    return formatFailure(res, 404, "Gallery item not found", []);
  }

  const payload = normalizePayload(req.body);
  const files = req.files || [];
  const errors = validatePayload(payload);

  if (Object.keys(errors).length > 0) {
    cleanupFiles(files);
    return formatFailure(res, 400, "Validation failed", errors);
  }

  const nextImage = files[0]
    ? getGalleryImagePublicPath(files[0].filename)
    : existing.image;

  const updated = await updateGalleryRecord(existing.id, {
    ...payload,
    image: nextImage,
  });

  if (files[0] && existing.image && existing.image !== nextImage) {
    deleteFileIfExists(getGalleryImageAbsolutePath(existing.image));
  }

  for (const extraFile of files.slice(1)) {
    deleteFileIfExists(extraFile.path);
  }

  return formatSuccess(res, "Gallery item updated successfully", updated);
}

export async function deleteGallery(req, res) {
  const existing = await findById(req.params.id);

  if (!existing) {
    return formatFailure(res, 404, "Gallery item not found", []);
  }

  const removed = await removeGalleryRecord(existing.id);

  if (!removed) {
    return formatFailure(res, 500, "Unable to delete gallery item", []);
  }

  deleteFileIfExists(getGalleryImageAbsolutePath(existing.image));

  return formatSuccess(res, "Gallery item deleted successfully", { id: existing.id });
}
