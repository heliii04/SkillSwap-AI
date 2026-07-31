import express from "express";
import {
    submitContactInquiry,
    getAllContactInquiries,
    updateInquiryStatus,
} from "../controllers/contactController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route to submit contact inquiry
router.post("/", submitContactInquiry);

// Admin-only routes to get and update inquiries
router.get("/", requireAuth, requireAdmin, getAllContactInquiries);
router.patch("/:id", requireAuth, requireAdmin, updateInquiryStatus);

export default router;
