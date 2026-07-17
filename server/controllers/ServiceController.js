import {
  create as createServiceRecord,
  findActive,
  findAll,
  findById,
  findBySlug,
  remove as deleteServiceRecord,
  update as updateServiceRecord,
} from "../models/ServiceModel.js";
import {
  deleteFileIfExists,
  getServiceImageAbsolutePath,
  getServiceImagePublicPath,
  slugify,
} from "../services/uploadService.js";

function normalizePayload(body) {
  return {
    title: String(body?.title || "").trim(),
    slug: String(body?.slug || "").trim(),
    short_description: String(body?.short_description || "").trim(),
    description: String(body?.description || "").trim(),
    icon: String(body?.icon || "").trim(),
    display_order: Number(body?.display_order || 0),
    status: String(body?.status || "").trim() || "Active",
  };
}

function validatePayload(payload) {
  const errors = {};

  if (!payload.title) errors.title = "Title is required.";
  if (!payload.short_description) errors.short_description = "Short description is required.";
  if (!payload.description) errors.description = "Full description is required.";
  if (!Number.isFinite(payload.display_order) || payload.display_order < 0) {
    errors.display_order = "Display order must be zero or greater.";
  }
  if (!["Active", "Inactive"].includes(payload.status)) {
    errors.status = "Status must be Active or Inactive.";
  }

  return errors;
}

export async function getServices(_req, res) {
  const services = await findActive();
  return res.json(services);
}

export async function getService(req, res) {
  const service = await findBySlug(req.params.slug);

  if (!service || service.status !== "Active") {
    return res.status(404).json({
      success: false,
      message: "Service not found",
      errors: [],
    });
  }

  return res.json({
    success: true,
    message: "Service fetched successfully",
    data: service,
  });
}

export async function getAdminServices(_req, res) {
  const services = await findAll();
  return res.json({
    success: true,
    message: "Services fetched successfully",
    data: services,
  });
}

export async function getAdminService(req, res) {
  const service = await findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
      errors: [],
    });
  }

  return res.json({
    success: true,
    message: "Service fetched successfully",
    data: service,
  });
}

export async function createService(req, res) {
  const payload = normalizePayload(req.body);
  payload.slug = payload.slug || slugify(payload.title);
  const errors = validatePayload(payload);

  if (Object.keys(errors).length) {
    if (req.file) deleteFileIfExists(req.file.path);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const existing = await findBySlug(payload.slug);
  if (existing) {
    if (req.file) deleteFileIfExists(req.file.path);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: { slug: "Slug already exists." },
    });
  }

  const service = await createServiceRecord({
    ...payload,
    image: req.file ? getServiceImagePublicPath(req.file.filename) : "",
  });

  return res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
}

export async function updateService(req, res) {
  const existing = await findById(req.params.id);

  if (!existing) {
    if (req.file) deleteFileIfExists(req.file.path);
    return res.status(404).json({
      success: false,
      message: "Service not found",
      errors: [],
    });
  }

  const payload = normalizePayload(req.body);
  payload.slug = payload.slug || slugify(payload.title);
  const errors = validatePayload(payload);

  if (Object.keys(errors).length) {
    if (req.file) deleteFileIfExists(req.file.path);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const duplicate = await findBySlug(payload.slug);
  if (duplicate && duplicate.id !== existing.id) {
    if (req.file) deleteFileIfExists(req.file.path);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: { slug: "Slug already exists." },
    });
  }

  const nextImage = req.file ? getServiceImagePublicPath(req.file.filename) : existing.image || "";
  const service = await updateServiceRecord(existing.id, {
    ...payload,
    image: nextImage,
  });

  if (req.file && existing.image && existing.image !== nextImage) {
    deleteFileIfExists(getServiceImageAbsolutePath(existing.image));
  }

  return res.json({
    success: true,
    message: "Service updated successfully",
    data: service,
  });
}

export async function deleteService(req, res) {
  const existing = await findById(req.params.id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Service not found",
      errors: [],
    });
  }

  const deleted = await deleteServiceRecord(existing.id);
  if (!deleted) {
    return res.status(500).json({
      success: false,
      message: "Could not delete service",
      errors: [],
    });
  }

  deleteFileIfExists(getServiceImageAbsolutePath(existing.image));

  return res.json({
    success: true,
    message: "Service deleted successfully",
    data: { id: existing.id },
  });
}
