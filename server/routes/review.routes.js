import express from "express";
import { addReview, getUserReviews, getMyReviewForUser } from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user/:userId", getUserReviews);
router.get("/my/:targetUserId", requireAuth, getMyReviewForUser);
router.post("/", requireAuth, addReview);

export default router;
