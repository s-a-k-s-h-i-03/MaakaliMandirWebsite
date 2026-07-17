import { ApiResponse } from "../utils/ApiResponse.js";
import {
  create as createEventRecord,
  findActive,
  findAll,
  findById,
  remove as deleteEventRecord,
  update as updateEventRecord,
} from "../models/EventModel.js";
import {
  deleteFileIfExists,
  getEventImageAbsolutePath,
  getEventImagePublicPath,
} from "../services/uploadService.js";

function createHttpError(statusCode, message, extra = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  Object.assign(error, extra);
  return error;
}

function normalizeEventPayload(body) {
  return {
    title: String(body?.title || "").trim(),
    description: String(body?.description || "").trim(),
    event_date: String(body?.event_date || body?.date || "").trim(),
    location: String(body?.location || "").trim(),
    status: String(body?.status || "").trim(),
  };
}

function validateEventPayload(payload) {
  const errors = {};

  if (!payload.title) {
    errors.title = "Title is required.";
  } else if (payload.title.length < 5) {
    errors.title = "Title must be at least 5 characters.";
  }

  if (!payload.description) {
    errors.description = "Description is required.";
  }

  if (!payload.event_date) {
    errors.event_date = "Date is required.";
  }

  if (!payload.location) {
    errors.location = "Location is required.";
  }

  if (!payload.status) {
    errors.status = "Status is required.";
  } else if (!["Active", "Inactive"].includes(payload.status)) {
    errors.status = "Status must be Active or Inactive.";
  }

  return errors;
}

function success(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export async function getEvents(_req, res) {
  const rows = await findActive();
  return ApiResponse.json(res, rows);
}

export async function getAdminEvents(_req, res) {
  const rows = await findAll();
  return ApiResponse.json(res, rows);
}

export async function getEvent(req, res) {
  const event = await findById(req.params.id);

  if (!event) {
    throw createHttpError(404, "Event not found.");
  }

  return success(res, "Event fetched successfully", event);
}

export async function uploadEventImage(req, res) {
  if (!req.file) {
    throw createHttpError(400, "Image file is required.");
  }

  return res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    path: getEventImagePublicPath(req.file.filename),
    data: {
      image: getEventImagePublicPath(req.file.filename),
    },
  });
}

export async function deleteEvent(req, res) {
  const existingEvent = await findById(req.params.id);

  if (!existingEvent) {
    throw createHttpError(404, "Event not found.");
  }

  const deleted = await deleteEventRecord(req.params.id);

  if (!deleted) {
    throw createHttpError(500, "Unable to delete event.");
  }

  deleteFileIfExists(getEventImageAbsolutePath(existingEvent.image));

  return success(res, "Event deleted successfully", { id: Number(req.params.id) });
}

export async function createEvent(req, res) {
  const payload = normalizeEventPayload(req.body);
  const errors = validateEventPayload(payload);

  if (Object.keys(errors).length > 0) {
    if (req.file) {
      deleteFileIfExists(req.file.path);
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const event = await createEventRecord({
    ...payload,
    image: req.file ? getEventImagePublicPath(req.file.filename) : "",
  });

  return success(res, "Event created successfully", event, 201);
}

export async function updateEvent(req, res) {
  const existingEvent = await findById(req.params.id);

  if (!existingEvent) {
    if (req.file) {
      deleteFileIfExists(req.file.path);
    }

    throw createHttpError(404, "Event not found.");
  }

  const payload = normalizeEventPayload(req.body);
  const errors = validateEventPayload(payload);

  if (Object.keys(errors).length > 0) {
    if (req.file) {
      deleteFileIfExists(req.file.path);
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const nextImage = req.file ? getEventImagePublicPath(req.file.filename) : existingEvent.image || "";
  const updatedEvent = await updateEventRecord(req.params.id, {
    ...payload,
    image: nextImage,
  });

  if (req.file && existingEvent.image && existingEvent.image !== nextImage) {
    deleteFileIfExists(getEventImageAbsolutePath(existingEvent.image));
  }

  return success(res, "Event updated successfully", updatedEvent);
}
