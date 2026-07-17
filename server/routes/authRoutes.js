import express from "express";

import {
    registerUser,
    verifyEmailOtp,
    resendEmailOtp,
    loginUser,
    logoutUser,
    getCurrentUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/verify-email", verifyEmailOtp);

router.post(
    "/resend-verification-otp",
    resendEmailOtp
);

router.post("/logout", logoutUser);

router.get("/me", protect, getCurrentUser);

export default router;