import express from "express";
import {
    createReport,
    getUserReports,
    getAllReports,
    updateReportStatus
} from "../controllers/reportController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createReport);
router.get("/my-reports", getUserReports);

// Admin moderation endpoints
router.get("/admin", requireAdmin, getAllReports);
router.patch("/admin/:id", requireAdmin, updateReportStatus);

export default router;
