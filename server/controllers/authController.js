import { env } from "../config/env.js";
import { AuthSession } from "../models/AuthSession.js";
import { User } from "../models/User.js";
import { sendVerificationOtpEmail } from "../services/email.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
    comparePassword,
    generateOtp,
    generateSessionToken,
    getOtpExpiryDate,
    getRefreshTokenExpiryDate,
    hashPassword,
    hashValue,
    normalizeEmail,
} from "../utils/auth.utils.js";

import {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken,
} from "../utils/token.utils.js";

const REFRESH_COOKIE_NAME = "skillswap_refresh_token";

function getRefreshCookieOptions() {
    return {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: env.isProduction
            ? "none"
            : "lax",
        maxAge:
            env.jwtRefreshExpiresInDays *
            24 *
            60 *
            60 *
            1000,
        path: "/api/v1/auth",
    };
}

function clearRefreshCookie(res) {
    res.clearCookie(
        REFRESH_COOKIE_NAME,
        getRefreshCookieOptions()
    );
}

function getClientIp(req) {
    const forwardedFor =
        req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string") {
        return forwardedFor.split(",")[0].trim();
    }

    return req.ip || req.socket.remoteAddress || "";
}

async function createAuthenticatedSession(
    user,
    req,
    res
) {
    const rawSessionToken = generateSessionToken();

    const session = await AuthSession.create({
        user: user._id,
        tokenHash: hashValue(rawSessionToken),
        userAgent: req.get("user-agent") || "",
        ipAddress: getClientIp(req),
        expiresAt: getRefreshTokenExpiryDate(),
    });

    const accessToken = createAccessToken(user);

    const refreshToken = createRefreshToken({
        userId: user._id,
        sessionId: session._id,
        rawSessionToken,
    });

    res.cookie(
        REFRESH_COOKIE_NAME,
        refreshToken,
        getRefreshCookieOptions()
    );

    return accessToken;
}

export const register = asyncHandler(
    async (req, res) => {
        const {
            name,
            email: submittedEmail,
            password,
        } = req.body;

        const email = normalizeEmail(submittedEmail);

        let user = await User.findOne({
            email,
        }).select(
            "+passwordHash " +
            "+emailVerificationOtpHash " +
            "+emailVerificationOtpExpiresAt " +
            "+emailVerificationOtpAttempts " +
            "+emailVerificationOtpLastSentAt"
        );

        if (user?.isEmailVerified) {
            throw new ApiError(
                409,
                "An account already exists with this email.",
                [],
                "EMAIL_ALREADY_REGISTERED"
            );
        }

        const passwordHash =
            await hashPassword(password);

        const otp = generateOtp();
        const otpHash = hashValue(otp);

        if (user) {
            user.name = name;
            user.passwordHash = passwordHash;
            user.emailVerificationOtpHash = otpHash;
            user.emailVerificationOtpExpiresAt =
                getOtpExpiryDate();
            user.emailVerificationOtpAttempts = 0;
            user.emailVerificationOtpLastSentAt =
                new Date();

            await user.save();
        } else {
            user = await User.create({
                name,
                email,
                passwordHash,
                emailVerificationOtpHash: otpHash,
                emailVerificationOtpExpiresAt:
                    getOtpExpiryDate(),
                emailVerificationOtpAttempts: 0,
                emailVerificationOtpLastSentAt:
                    new Date(),
            });
        }

        try {
            await sendVerificationOtpEmail({
                name: user.name,
                email: user.email,
                otp,
            });
        } catch (error) {
            console.error(
                "Verification email failed:",
                error.message
            );

            throw new ApiError(
                503,
                "Unable to send verification email. Please try again.",
                [],
                "EMAIL_DELIVERY_FAILED"
            );
        }

        res.status(201).json({
            success: true,
            message:
                "Registration successful. Verification OTP has been sent.",
            data: {
                email: user.email,
                requiresVerification: true,
            },
        });
    }
);

export const verifyEmail = asyncHandler(
    async (req, res) => {
        const {
            email: submittedEmail,
            otp,
        } = req.body;

        const email = normalizeEmail(submittedEmail);

        const user = await User.findOne({
            email,
        }).select(
            "+emailVerificationOtpHash " +
            "+emailVerificationOtpExpiresAt " +
            "+emailVerificationOtpAttempts"
        );

        if (!user) {
            throw new ApiError(
                400,
                "Invalid email or verification code.",
                [],
                "INVALID_VERIFICATION_CODE"
            );
        }

        if (user.isEmailVerified) {
            throw new ApiError(
                409,
                "This email is already verified.",
                [],
                "EMAIL_ALREADY_VERIFIED"
            );
        }

        if (
            !user.emailVerificationOtpHash ||
            !user.emailVerificationOtpExpiresAt
        ) {
            throw new ApiError(
                400,
                "Verification code is invalid or expired.",
                [],
                "INVALID_VERIFICATION_CODE"
            );
        }

        if (
            user.emailVerificationOtpAttempts >= 5
        ) {
            throw new ApiError(
                429,
                "Too many incorrect attempts. Request a new OTP.",
                [],
                "OTP_ATTEMPTS_EXCEEDED"
            );
        }

        if (
            user.emailVerificationOtpExpiresAt <
            new Date()
        ) {
            throw new ApiError(
                400,
                "Verification code has expired. Request a new OTP.",
                [],
                "OTP_EXPIRED"
            );
        }

        const submittedOtpHash = hashValue(otp);

        if (
            submittedOtpHash !==
            user.emailVerificationOtpHash
        ) {
            user.emailVerificationOtpAttempts += 1;
            await user.save();

            throw new ApiError(
                400,
                "Invalid email or verification code.",
                [],
                "INVALID_VERIFICATION_CODE"
            );
        }

        user.isEmailVerified = true;
        user.emailVerificationOtpHash = null;
        user.emailVerificationOtpExpiresAt = null;
        user.emailVerificationOtpAttempts = 0;
        user.emailVerificationOtpLastSentAt = null;
        user.lastLoginAt = new Date();

        await user.save();

        const accessToken =
            await createAuthenticatedSession(
                user,
                req,
                res
            );

        res.status(200).json({
            success: true,
            message:
                "Email verified successfully.",
            data: {
                accessToken,
                user,
            },
        });
    }
);

export const resendOtp = asyncHandler(
    async (req, res) => {
        const email = normalizeEmail(
            req.body.email
        );

        const user = await User.findOne({
            email,
        }).select(
            "+emailVerificationOtpHash " +
            "+emailVerificationOtpExpiresAt " +
            "+emailVerificationOtpAttempts " +
            "+emailVerificationOtpLastSentAt"
        );

        if (!user) {
            return res.status(200).json({
                success: true,
                message:
                    "If an unverified account exists, a new OTP has been sent.",
            });
        }

        if (user.isEmailVerified) {
            throw new ApiError(
                409,
                "This email is already verified.",
                [],
                "EMAIL_ALREADY_VERIFIED"
            );
        }

        const cooldownMilliseconds = 60 * 1000;

        if (
            user.emailVerificationOtpLastSentAt &&
            Date.now() -
            user.emailVerificationOtpLastSentAt.getTime() <
            cooldownMilliseconds
        ) {
            throw new ApiError(
                429,
                "Please wait before requesting another OTP.",
                [],
                "OTP_RESEND_COOLDOWN"
            );
        }

        const otp = generateOtp();

        user.emailVerificationOtpHash =
            hashValue(otp);
        user.emailVerificationOtpExpiresAt =
            getOtpExpiryDate();
        user.emailVerificationOtpAttempts = 0;
        user.emailVerificationOtpLastSentAt =
            new Date();

        await user.save();

        await sendVerificationOtpEmail({
            name: user.name,
            email: user.email,
            otp,
        });

        res.status(200).json({
            success: true,
            message:
                "A new verification OTP has been sent.",
        });
    }
);

export const login = asyncHandler(
    async (req, res) => {
        const email = normalizeEmail(
            req.body.email
        );

        const user = await User.findOne({
            email,
        }).select(
            "+passwordHash"
        );

        /*
         * Same response for missing user and missing
         * password hash to avoid leaking account details.
         */
        if (!user || !user.passwordHash) {
            throw new ApiError(
                401,
                "Invalid email or password.",
                [],
                "INVALID_CREDENTIALS"
            );
        }

        const passwordMatches =
            await comparePassword(
                req.body.password,
                user.passwordHash
            );

        if (!passwordMatches) {
            throw new ApiError(
                401,
                "Invalid email or password.",
                [],
                "INVALID_CREDENTIALS"
            );
        }

        if (!user.isEmailVerified) {
            throw new ApiError(
                403,
                "Verify your email before logging in.",
                [],
                "EMAIL_NOT_VERIFIED"
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

        user.lastLoginAt = new Date();

        await user.save();

        const accessToken =
            await createAuthenticatedSession(
                user,
                req,
                res
            );

        res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                accessToken,
                user,
            },
        });
    }
);

export const refreshAccessToken = asyncHandler(
    async (req, res) => {
        const refreshToken =
            req.cookies[REFRESH_COOKIE_NAME];

        if (!refreshToken) {
            throw new ApiError(
                401,
                "Refresh token is required.",
                [],
                "REFRESH_TOKEN_REQUIRED"
            );
        }

        let payload;

        try {
            payload =
                verifyRefreshToken(refreshToken);
        } catch {
            clearRefreshCookie(res);

            throw new ApiError(
                401,
                "Refresh token is invalid or expired.",
                [],
                "INVALID_REFRESH_TOKEN"
            );
        }

        if (payload.type !== "refresh") {
            clearRefreshCookie(res);

            throw new ApiError(
                401,
                "Invalid refresh token.",
                [],
                "INVALID_REFRESH_TOKEN"
            );
        }

        const session = await AuthSession.findById(
            payload.sid
        ).select("+tokenHash");

        if (
            !session ||
            session.revokedAt ||
            session.expiresAt < new Date()
        ) {
            clearRefreshCookie(res);

            throw new ApiError(
                401,
                "Session has expired.",
                [],
                "SESSION_EXPIRED"
            );
        }

        if (
            session.user.toString() !==
            payload.sub
        ) {
            clearRefreshCookie(res);

            throw new ApiError(
                401,
                "Invalid session.",
                [],
                "INVALID_SESSION"
            );
        }

        const presentedTokenHash = hashValue(
            payload.token
        );

        if (
            presentedTokenHash !==
            session.tokenHash
        ) {
            session.revokedAt = new Date();
            await session.save();

            clearRefreshCookie(res);

            throw new ApiError(
                401,
                "Refresh token reuse detected.",
                [],
                "REFRESH_TOKEN_REUSE_DETECTED"
            );
        }

        const user = await User.findById(
            session.user
        );

        if (
            !user ||
            user.accountStatus !== "active"
        ) {
            session.revokedAt = new Date();
            await session.save();

            clearRefreshCookie(res);

            throw new ApiError(
                401,
                "User session is no longer valid.",
                [],
                "INVALID_USER_SESSION"
            );
        }

        /*
         * Refresh-token rotation:
         * old session token is replaced on every refresh.
         */
        const newRawSessionToken =
            generateSessionToken();

        session.tokenHash = hashValue(
            newRawSessionToken
        );

        session.lastUsedAt = new Date();
        session.expiresAt =
            getRefreshTokenExpiryDate();

        await session.save();

        const newRefreshToken =
            createRefreshToken({
                userId: user._id,
                sessionId: session._id,
                rawSessionToken:
                    newRawSessionToken,
            });

        const accessToken =
            createAccessToken(user);

        res.cookie(
            REFRESH_COOKIE_NAME,
            newRefreshToken,
            getRefreshCookieOptions()
        );

        res.status(200).json({
            success: true,
            message:
                "Access token refreshed successfully.",
            data: {
                accessToken,
            },
        });
    }
);

export const logout = asyncHandler(
    async (req, res) => {
        const refreshToken =
            req.cookies[REFRESH_COOKIE_NAME];

        if (refreshToken) {
            try {
                const payload =
                    verifyRefreshToken(
                        refreshToken
                    );

                await AuthSession.findByIdAndUpdate(
                    payload.sid,
                    {
                        revokedAt: new Date(),
                    }
                );
            } catch {
                // Invalid or expired cookie is still cleared.
            }
        }

        clearRefreshCookie(res);

        res.status(200).json({
            success: true,
            message: "Logout successful.",
        });
    }
);

export const getCurrentUser = asyncHandler(
    async (req, res) => {
        res.status(200).json({
            success: true,
            data: {
                user: req.user,
            },
        });
    }
);

export const registerUser = register;
export const verifyEmailOtp = verifyEmail;
export const resendEmailOtp = resendOtp;
export const loginUser = login;
export const logoutUser = logout;