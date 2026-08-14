import express from "express";
import {
    getAdminStats,
    getAllUsers,
    toggleUserStatus,
    getAllSkills,
    deleteSkill,
    getSkillUsers
} from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { adminLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.use(adminLimiter);

router.get("/stats", requireAuth, requireAdmin, getAdminStats);
router.get("/users", requireAuth, requireAdmin, getAllUsers);
router.put("/users/:id/status", requireAuth, requireAdmin, toggleUserStatus);
router.get("/skills", requireAuth, requireAdmin, getAllSkills);
router.delete("/skills/:id", requireAuth, requireAdmin, deleteSkill);
router.get("/skills/:id/users", requireAuth, requireAdmin, getSkillUsers);

export default router;
