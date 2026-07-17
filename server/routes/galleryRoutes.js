import { Router } from "express";
import {
  getCategory,
  getGallery,
  getGalleryItem,
} from "../controllers/GalleryController.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

const router = Router();

router.get("/api/gallery", asyncHandler(getGallery));
router.get("/api/gallery/category/:category", asyncHandler(getCategory));
router.get("/api/gallery/:id", asyncHandler(getGalleryItem));

export default router;
