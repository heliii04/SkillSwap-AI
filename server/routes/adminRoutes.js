import express from "express";
import {
    getAdminStats,
    getAllUsers,
    toggleUserStatus,
    getAllSkills,
    deleteSkill
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", requireAuth, requireAdmin, getAdminStats);
router.get("/users", requireAuth, requireAdmin, getAllUsers);
router.put("/users/:id/status", requireAuth, requireAdmin, toggleUserStatus);
router.get("/skills", requireAuth, requireAdmin, getAllSkills);
router.delete("/skills/:id", requireAuth, requireAdmin, deleteSkill);

export default router;
