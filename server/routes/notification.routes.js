import express from "express";
import {
    getNotifications,
    markAsRead,
    deleteNotification,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getNotifications);
router.patch("/mark-read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
