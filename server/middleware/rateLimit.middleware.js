import { rateLimit } from "express-rate-limit";

const createRateLimitMessage = (message) => ({
    success: false,
    message,
});

export const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Too many requests. Please try again after 15 minutes."
    ),

    skip: (req) => req.method === "OPTIONS",
});

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Too many registration attempts. Please try again after one hour."
    ),

    skipSuccessfulRequests: false,
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Too many login attempts. Please try again after 15 minutes."
    ),

    skipSuccessfulRequests: true,
});

export const verifyEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Too many verification attempts. Please try again after 15 minutes."
    ),
});

export const resendOtpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Too many OTP requests. Please try again after one hour."
    ),
});