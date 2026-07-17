import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAdminEvents,
  getEvent,
  getEvents,
  updateEvent,
  uploadEventImage,
} from "../controllers/eventController.js";
import upload from "../config/multer.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

const router = Router();

router.get("/api/events", asyncHandler(getEvents));
router.get("/api/admin/events", authMiddleware, asyncHandler(getAdminEvents));
router.get("/api/admin/events/:id", authMiddleware, asyncHandler(getEvent));
router.post("/api/admin/upload", authMiddleware, upload.single("image"), asyncHandler(uploadEventImage));
router.post("/api/admin/events", authMiddleware, upload.single("image"), asyncHandler(createEvent));
router.put("/api/admin/events/:id", authMiddleware, upload.single("image"), asyncHandler(updateEvent));
router.delete("/api/admin/events/:id", authMiddleware, asyncHandler(deleteEvent));

export default router;
