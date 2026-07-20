import { Router } from "express";
import { getService, getServices } from "../controllers/ServiceController.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

const router = Router();

router.get("/api/services", asyncHandler(getServices));
router.get("/api/services/:slug", asyncHandler(getService));

export default router;
