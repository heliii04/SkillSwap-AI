import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
    getCurrentUser,
    login,
    logout,
    refreshAccessToken,
    register,
    resendOtp,
    verifyEmail,
} from "../controllers/authController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
    loginSchema,
    registerSchema,
    resendOtpSchema,
    verifyEmailSchema,
} from "../validators/auth.validator.js";

const router = Router();

const sensitiveAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        errors: [],
    },
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Too many OTP requests. Please try again later.",
        code: "OTP_RATE_LIMIT_EXCEEDED",
        errors: [],
    },
});

router.post(
    "/register",
    sensitiveAuthLimiter,
    validate(registerSchema),
    register
);

router.post(
    "/verify-email",
    otpLimiter,
    validate(verifyEmailSchema),
    verifyEmail
);

router.post(
    "/resend-otp",
    otpLimiter,
    validate(resendOtpSchema),
    resendOtp
);

router.post(
    "/login",
    sensitiveAuthLimiter,
    validate(loginSchema),
    login
);

router.post(
    "/refresh-token",
    refreshAccessToken
);

router.post(
    "/logout",
    logout
);

router.get(
    "/me",
    requireAuth,
    getCurrentUser
);

export default router;