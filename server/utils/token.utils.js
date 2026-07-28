import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function createAccessToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
            type: "access",
        },
        env.jwtAccessSecret,
        {
            expiresIn: env.jwtAccessExpiresIn,
            issuer: "skillswap-ai",
            audience: "skillswap-ai-client",
        }
    );
}

export function createRefreshToken({
    userId,
    sessionId,
    rawSessionToken,
}) {
    return jwt.sign(
        {
            sub: userId.toString(),
            sid: sessionId.toString(),
            token: rawSessionToken,
            type: "refresh",
        },
        env.jwtRefreshSecret,
        {
            expiresIn: `${env.jwtRefreshExpiresInDays}d`,
            issuer: "skillswap-ai",
            audience: "skillswap-ai-client",
        }
    );
}

export function verifyAccessToken(token) {
    return jwt.verify(
        token,
        env.jwtAccessSecret,
        {
            issuer: "skillswap-ai",
            audience: "skillswap-ai-client",
        }
    );
}

export function verifyRefreshToken(token) {
    return jwt.verify(
        token,
        env.jwtRefreshSecret,
        {
            issuer: "skillswap-ai",
            audience: "skillswap-ai-client",
        }
    );
}