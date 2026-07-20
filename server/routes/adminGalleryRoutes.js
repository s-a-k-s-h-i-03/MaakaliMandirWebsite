import { Router } from "express";
import {
  createGallery,
  deleteGallery,
  getAdminGallery,
  getAdminGalleryItem,
  updateGallery,
} from "../controllers/GalleryController.js";
import { galleryUpload } from "../config/multer.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

const router = Router();

router.get("/api/admin/gallery", authMiddleware, asyncHandler(getAdminGallery));
router.get("/api/admin/gallery/:id", authMiddleware, asyncHandler(getAdminGalleryItem));
router.post("/api/admin/gallery", authMiddleware, galleryUpload.array("images", 12), asyncHandler(createGallery));
router.put("/api/admin/gallery/:id", authMiddleware, galleryUpload.array("images", 4), asyncHandler(updateGallery));
router.delete("/api/admin/gallery/:id", authMiddleware, asyncHandler(deleteGallery));

export default router;
