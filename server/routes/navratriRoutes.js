import { Router } from "express";
import {
  deleteNavratriRegistrations,
  deleteNavratriRegistrationItem,
  exportNavratri,
  getNavratri,
} from "../controllers/navratriController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

const router = Router();

router.get("/api/navratri", asyncHandler(getNavratri));
router.get("/api/admin/export/navratri", authMiddleware, asyncHandler(exportNavratri));
router.delete("/api/admin/navratri/item", authMiddleware, asyncHandler(deleteNavratriRegistrationItem));
router.delete("/api/admin/navratri", authMiddleware, asyncHandler(deleteNavratriRegistrations));

export default router;
