import { Router } from "express";
import {
  createDonationEntry,
  deleteDonationEntry,
  getDonationById,
  getDonationDashboardStats,
  exportDonations,
  getDonations,
  getPayHeads,
  submitEnquiry,
  updateDonationEntry,
} from "../controllers/donationController.js";
import {
  createDonationHead,
  deleteDonationHead,
  getAdminDonationHeads,
  getDonationHeads,
  updateDonationHead,
} from "../controllers/DonationHeadController.js";
import { createOrder, verifyPayment } from "../controllers/PaymentController.js";
import { getReceipt } from "../controllers/ReceiptController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorMiddleware.js";

const router = Router();

router.get("/api/donation-heads", asyncHandler(getDonationHeads));
router.post("/api/donations", asyncHandler(createDonationEntry));
router.post("/api/payments/create-order", asyncHandler(createOrder));
router.post("/api/payments/verify", asyncHandler(verifyPayment));
router.get("/api/donations/receipt/:id", asyncHandler(getReceipt));

router.get("/api/admin/donations", authMiddleware, asyncHandler(getDonations));
router.get("/api/admin/donations/stats", authMiddleware, asyncHandler(getDonationDashboardStats));
router.get("/api/admin/donations/:id", authMiddleware, asyncHandler(getDonationById));
router.put("/api/admin/donations/:id", authMiddleware, asyncHandler(updateDonationEntry));
router.delete("/api/admin/donations/:id", authMiddleware, asyncHandler(deleteDonationEntry));
router.get("/api/admin/export/donations", authMiddleware, asyncHandler(exportDonations));
router.get("/api/admin/donation-heads", authMiddleware, asyncHandler(getAdminDonationHeads));
router.post("/api/admin/donation-heads", authMiddleware, asyncHandler(createDonationHead));
router.put("/api/admin/donation-heads/:id", authMiddleware, asyncHandler(updateDonationHead));
router.delete("/api/admin/donation-heads/:id", authMiddleware, asyncHandler(deleteDonationHead));

router.get("/api/pay-heads", asyncHandler(getPayHeads));
router.post("/api/enquiry", asyncHandler(submitEnquiry));

export default router;
