import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "../config/env.js";

export async function hashPassword(password) {
    return bcrypt.hash(
        password,
        env.bcryptSaltRounds
    );
}

export async function comparePassword(
    password,
    passwordHash
) {
    if (
        typeof password !== "string" ||
        typeof passwordHash !== "string"
    ) {
        return false;
    }

    return bcrypt.compare(
        password,
        passwordHash
    );
}

export function generateOtp() {
    return crypto.randomInt(
        100000,
        1000000
    ).toString();
}

export function generateSessionToken() {
    return crypto.randomBytes(32).toString("hex");
}

export function getOtpExpiryDate() {
    return new Date(
        Date.now() +
        env.otpExpiresInMinutes * 60 * 1000
    );
}

export function getRefreshTokenExpiryDate() {
    return new Date(
        Date.now() +
        env.jwtRefreshExpiresInDays *
        24 *
        60 *
        60 *
        1000
    );
}

export function hashValue(value) {
    if (typeof value !== "string") {
        return "";
    }
    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");
}

export function normalizeEmail(email) {
    if (typeof email !== "string") {
        return "";
    }
    return email.trim().toLowerCase();
}