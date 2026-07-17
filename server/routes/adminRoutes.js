import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

const router = Router();

router.get("/api/admin/dashboard/stats", authMiddleware, asyncHandler(getDashboardStats));

export default router;
