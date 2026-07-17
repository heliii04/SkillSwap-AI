import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { sendOtpEmail } from "../services/email.service.js";
import { generateOtp } from "../utils/generateOtp.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const PASSWORD_SALT_ROUNDS = 12;

const normalizeEmail = (email = "") => {
    if (typeof email !== "string") {
        return "";
    }

    return email.trim().toLowerCase();
};

const hashOtp = (otp) => {
    return crypto
        .createHash("sha256")
        .update(String(otp))
        .digest("hex");
};

const generateAccessToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            userId: userId.toString(),
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
            issuer: "skillswap-ai",
            audience: "skillswap-ai-users",
        }
    );
};

const setAuthCookie = (res, token) => {
    const isProduction =
        process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
};

const getSafeUser = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
    };
};

/* =========================
   REGISTER USER
========================= */

export const registerUser = async (req, res, next) => {
    try {
        const {
            name: rawName,
            email: rawEmail,
            password,
        } = req.body ?? {};

        const name =
            typeof rawName === "string"
                ? rawName.trim()
                : "";

        const email = normalizeEmail(rawEmail);

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required.",
            });
        }

        if (typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be a valid string.",
            });
        }

        if (name.length < 2 || name.length > 80) {
            return res.status(400).json({
                success: false,
                message:
                    "Name must contain between 2 and 80 characters.",
            });
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address.",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters.",
            });
        }

        const existingUser = await User.findOne({
            email,
        }).select(
            "+password " +
            "+emailVerificationOtpHash " +
            "+emailVerificationOtpExpiresAt " +
            "+emailVerificationOtpAttempts " +
            "+emailVerificationOtpLastSentAt"
        );

        if (existingUser?.isEmailVerified) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists.",
            });
        }

        const otp = generateOtp();
        const otpHash = hashOtp(otp);

        const otpExpiresAt = new Date(
            Date.now() +
            OTP_EXPIRY_MINUTES * 60 * 1000
        );

        const hashedPassword = await bcrypt.hash(
            password,
            PASSWORD_SALT_ROUNDS
        );

        let user;

        if (existingUser) {
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.emailVerificationOtpHash =
                otpHash;
            existingUser.emailVerificationOtpExpiresAt =
                otpExpiresAt;
            existingUser.emailVerificationOtpAttempts = 0;
            existingUser.emailVerificationOtpLastSentAt =
                new Date();

            user = await existingUser.save();
        } else {
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                emailVerificationOtpHash: otpHash,
                emailVerificationOtpExpiresAt:
                    otpExpiresAt,
                emailVerificationOtpAttempts: 0,
                emailVerificationOtpLastSentAt:
                    new Date(),
            });
        }

        try {
            await sendOtpEmail({
                to: user.email,
                name: user.name,
                otp,
                expiryMinutes:
                    OTP_EXPIRY_MINUTES,
            });
        } catch (emailError) {
            console.error(
                "Registration OTP email failed:",
                {
                    message: emailError.message,
                    userId: user._id.toString(),
                }
            );

            return res.status(503).json({
                success: false,
                message:
                    "Account created, but verification email could not be sent. Please request a new OTP.",
                requiresVerification: true,
                email: user.email,
            });
        }

        return res.status(201).json({
            success: true,
            message:
                "Verification code sent to your email.",
            data: {
                email: user.email,
                expiresInSeconds:
                    OTP_EXPIRY_MINUTES * 60,
                resendAvailableInSeconds:
                    OTP_RESEND_COOLDOWN_SECONDS,
            },
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists.",
            });
        }

        next(error);
    }
};

/* =========================
   VERIFY EMAIL OTP
========================= */

export const verifyEmailOtp = async (
    req,
    res,
    next
) => {
    try {
        const {
            email: rawEmail,
            otp: rawOtp,
        } = req.body ?? {};

        const email = normalizeEmail(rawEmail);
        const otp = String(rawOtp ?? "").trim();

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and verification code are required.",
            });
        }

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message:
                    "Verification code must contain 6 digits.",
            });
        }

        const user = await User.findOne({
            email,
        }).select(
            "+emailVerificationOtpHash " +
            "+emailVerificationOtpExpiresAt " +
            "+emailVerificationOtpAttempts"
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired verification code.",
            });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message:
                    "Email is already verified.",
                user: getSafeUser(user),
            });
        }

        if (
            !user.emailVerificationOtpHash ||
            !user.emailVerificationOtpExpiresAt
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired verification code. Please request a new code.",
            });
        }

        if (
            user.emailVerificationOtpExpiresAt.getTime() <
            Date.now()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Verification code has expired. Please request a new code.",
            });
        }

        if (
            user.emailVerificationOtpAttempts >=
            OTP_MAX_ATTEMPTS
        ) {
            return res.status(429).json({
                success: false,
                message:
                    "Too many incorrect attempts. Please request a new verification code.",
            });
        }

        const submittedHash = hashOtp(otp);

        const storedHashBuffer = Buffer.from(
            user.emailVerificationOtpHash,
            "hex"
        );

        const submittedHashBuffer = Buffer.from(
            submittedHash,
            "hex"
        );

        const isOtpValid =
            storedHashBuffer.length ===
            submittedHashBuffer.length &&
            crypto.timingSafeEqual(
                storedHashBuffer,
                submittedHashBuffer
            );

        if (!isOtpValid) {
            user.emailVerificationOtpAttempts += 1;

            await user.save();

            const remainingAttempts = Math.max(
                OTP_MAX_ATTEMPTS -
                user.emailVerificationOtpAttempts,
                0
            );

            return res.status(400).json({
                success: false,
                message:
                    "Invalid verification code.",
                remainingAttempts,
            });
        }

        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
        user.emailVerificationOtpHash = undefined;
        user.emailVerificationOtpExpiresAt =
            undefined;
        user.emailVerificationOtpAttempts = 0;
        user.emailVerificationOtpLastSentAt =
            undefined;

        await user.save();

        const token = generateAccessToken(user._id);

        setAuthCookie(res, token);

        return res.status(200).json({
            success: true,
            message:
                "Email verified successfully.",
            user: getSafeUser(user),
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   RESEND EMAIL OTP
========================= */

export const resendEmailOtp = async (
    req,
    res,
    next
) => {
    try {
        const { email: rawEmail } =
            req.body ?? {};

        const email = normalizeEmail(rawEmail);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const genericResponse = {
            success: true,
            message:
                "If an unverified account exists, a verification code has been sent.",
        };

        const user = await User.findOne({
            email,
        }).select(
            "+emailVerificationOtpLastSentAt"
        );

        if (!user || user.isEmailVerified) {
            return res
                .status(200)
                .json(genericResponse);
        }

        if (
            user.emailVerificationOtpLastSentAt
        ) {
            const elapsedMilliseconds =
                Date.now() -
                user.emailVerificationOtpLastSentAt.getTime();

            const cooldownMilliseconds =
                OTP_RESEND_COOLDOWN_SECONDS *
                1000;

            if (
                elapsedMilliseconds <
                cooldownMilliseconds
            ) {
                const waitSeconds = Math.ceil(
                    (cooldownMilliseconds -
                        elapsedMilliseconds) /
                    1000
                );

                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitSeconds} seconds before requesting another code.`,
                    retryAfterSeconds:
                        waitSeconds,
                });
            }
        }

        const otp = generateOtp();

        user.emailVerificationOtpHash =
            hashOtp(otp);

        user.emailVerificationOtpExpiresAt =
            new Date(
                Date.now() +
                OTP_EXPIRY_MINUTES *
                60 *
                1000
            );

        user.emailVerificationOtpAttempts = 0;

        user.emailVerificationOtpLastSentAt =
            new Date();

        await user.save();

        try {
            await sendOtpEmail({
                to: user.email,
                name: user.name,
                otp,
                expiryMinutes:
                    OTP_EXPIRY_MINUTES,
            });
        } catch (emailError) {
            console.error(
                "Resend OTP email failed:",
                {
                    message: emailError.message,
                    userId:
                        user._id.toString(),
                }
            );

            return res.status(503).json({
                success: false,
                message:
                    "Verification email could not be sent. Please try again later.",
            });
        }

        return res
            .status(200)
            .json(genericResponse);
    } catch (error) {
        next(error);
    }
};

/* =========================
   LOGIN USER
========================= */

export const loginUser = async (
    req,
    res,
    next
) => {
    try {
        const {
            email: rawEmail,
            password,
        } = req.body ?? {};

        const email = normalizeEmail(rawEmail);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required.",
            });
        }

        if (typeof password !== "string") {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be a valid string.",
            });
        }

        const user = await User.findOne({
            email,
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password.",
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password.",
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message:
                    "Please verify your email before logging in.",
                requiresVerification: true,
                email: user.email,
            });
        }

        const token = generateAccessToken(
            user._id
        );

        setAuthCookie(res, token);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: getSafeUser(user),
        });
    } catch (error) {
        next(error);
    }
};

/* =========================
   LOGOUT USER
========================= */

export const logoutUser = async (
    req,
    res
) => {
    const isProduction =
        process.env.NODE_ENV === "production";

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction
            ? "none"
            : "lax",
        path: "/",
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
};

/* =========================
   CURRENT USER
========================= */

export const getCurrentUser = async (
    req,
    res
) => {
    return res.status(200).json({
        success: true,
        user: req.user,
    });
};