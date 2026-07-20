import { Router } from "express";
import {
  createService,
  deleteService,
  getAdminService,
  getAdminServices,
  updateService,
} from "../controllers/ServiceController.js";
import { serviceUpload } from "../config/multer.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

const router = Router();

router.get("/api/admin/services", authMiddleware, asyncHandler(getAdminServices));
router.get("/api/admin/services/:id", authMiddleware, asyncHandler(getAdminService));
router.post("/api/admin/services", authMiddleware, serviceUpload.single("image"), asyncHandler(createService));
router.put("/api/admin/services/:id", authMiddleware, serviceUpload.single("image"), asyncHandler(updateService));
router.delete("/api/admin/services/:id", authMiddleware, asyncHandler(deleteService));

export default router;
