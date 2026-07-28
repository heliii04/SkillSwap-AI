import { z } from "zod";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/token.utils.js";

// Validation schemas
const emailSchema = z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email address is too long.");

const passwordSchema = z
    .string()
    .min(
        8,
        "Password must contain at least 8 characters."
    )
    .max(
        72,
        "Password cannot contain more than 72 characters."
    )
    .regex(
        /[a-z]/,
        "Password must contain a lowercase letter."
    )
    .regex(
        /[A-Z]/,
        "Password must contain an uppercase letter."
    )
    .regex(
        /\d/,
        "Password must contain a number."
    )
    .regex(
        /[^A-Za-z0-9]/,
        "Password must contain a special character."
    );

export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(
                2,
                "Name must contain at least 2 characters."
            )
            .max(
                60,
                "Name cannot contain more than 60 characters."
            ),

        email: emailSchema,

        password: passwordSchema,
    }),
});

export const verifyEmailSchema = z.object({
    body: z.object({
        email: emailSchema,

        otp: z
            .string()
            .trim()
            .regex(
                /^\d{6}$/,
                "OTP must contain exactly 6 digits."
            ),
    }),
});

export const resendOtpSchema = z.object({
    body: z.object({
        email: emailSchema,
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: emailSchema,

        password: z
            .string()
            .min(1, "Password is required.")
            .max(72),
    }),
});

export const resendVerificationOtpSchema = resendOtpSchema;

// Authentication middleware
export const requireAuth = asyncHandler(
    async (req, _res, next) => {
        const authorization = req.headers.authorization;

        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {
            throw new ApiError(
                401,
                "Authentication is required.",
                [],
                "AUTHENTICATION_REQUIRED"
            );
        }

        const accessToken =
            authorization.split(" ")[1];

        let payload;

        try {
            payload = verifyAccessToken(accessToken);
        } catch {
            throw new ApiError(
                401,
                "Access token is invalid or expired.",
                [],
                "INVALID_ACCESS_TOKEN"
            );
        }

        if (payload.type !== "access") {
            throw new ApiError(
                401,
                "Invalid access token.",
                [],
                "INVALID_ACCESS_TOKEN"
            );
        }

        const user = await User.findById(payload.sub);

        if (!user) {
            throw new ApiError(
                401,
                "User account no longer exists.",
                [],
                "USER_NOT_FOUND"
            );
        }

        if (user.accountStatus !== "active") {
            throw new ApiError(
                403,
                "Your account is not active.",
                [],
                "ACCOUNT_NOT_ACTIVE"
            );
        }

        req.user = user;

        next();
    }
);