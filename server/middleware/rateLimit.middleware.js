import { ipKeyGenerator, rateLimit } from "express-rate-limit";

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

export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 30,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "AI usage limit reached. Please try again in an hour."
    ),

    keyGenerator: (req, res) =>
        req.user?._id?.toString() || ipKeyGenerator(req, res),
});

export const swapRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Too many swap requests created. Please wait 15 minutes."
    ),

    keyGenerator: (req, res) =>
        req.user?._id?.toString() || ipKeyGenerator(req, res),
});

export const messageLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Messaging rate limit reached. Please slow down your messages."
    ),

    keyGenerator: (req, res) =>
        req.user?._id?.toString() || ipKeyGenerator(req, res),
});

export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Admin panel request limit reached. Please wait 15 minutes."
    ),
});

export const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: createRateLimitMessage(
        "Too many support requests submitted. Please try again in an hour."
    ),
});
