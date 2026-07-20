import { Router } from "express";
import { adminLogin } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";
import { validateRequiredFields } from "../middleware/validateMiddleware.js";

const router = Router();

router.post(
  "/api/admin/login",
  validateRequiredFields(["username", "password"]),
  asyncHandler(adminLogin),
);

export default router;
