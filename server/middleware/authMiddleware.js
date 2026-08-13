import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/token.utils.js";
import { getOrCreateAdminUser } from "../utils/admin.utils.js";

export const optionalAuth = asyncHandler(async (req, _res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return next();
    }
    const accessToken = authorization.slice(7).trim();
    if (!accessToken) {
        return next();
    }
    try {
        const payload = verifyAccessToken(accessToken);
        if (payload.type === "access") {
            if (payload.sub === "static_admin_id") {
                req.user = await getOrCreateAdminUser();
            } else {
                const user = await User.findById(payload.sub);
                if (user && user.accountStatus !== "suspended") {
                    req.user = user;
                }
            }
        }
    } catch (err) {
        // Token invalid, ignore
    }
    next();
});

export const requireAuth = asyncHandler(
    async (req, _res, next) => {
        const authorization =
            req.headers.authorization;

        if (
            !authorization ||
            !authorization.startsWith(
                "Bearer "
            )
        ) {
            throw new ApiError(
                401,
                "Authentication is required.",
                [],
                "AUTHENTICATION_REQUIRED"
            );
        }

        const accessToken =
            authorization
                .slice(7)
                .trim();

        if (!accessToken) {
            throw new ApiError(
                401,
                "Authentication is required.",
                [],
                "AUTHENTICATION_REQUIRED"
            );
        }

        let payload;

        try {
            payload =
                verifyAccessToken(
                    accessToken
                );
        } catch {
            throw new ApiError(
                401,
                "Access token is invalid or expired.",
                [],
                "INVALID_ACCESS_TOKEN"
            );
        }

        if (
            payload.type !== "access"
        ) {
            throw new ApiError(
                401,
                "Invalid access token.",
                [],
                "INVALID_ACCESS_TOKEN"
            );
        }

        if (payload.sub === "static_admin_id") {
            req.user = await getOrCreateAdminUser();
            return next();
        }

        const user =
            await User.findById(
                payload.sub
            );

        if (!user) {
            throw new ApiError(
                401,
                "User account no longer exists.",
                [],
                "USER_NOT_FOUND"
            );
        }

        if (
            user.accountStatus !==
            "active"
        ) {
            throw new ApiError(
                403,
                "Your account is not active.",
                [],
                "ACCOUNT_NOT_ACTIVE"
            );
        }

        if (
            user.passwordChangedAt &&
            payload.iat
        ) {
            const passwordChangedAt =
                Math.floor(
                    user.passwordChangedAt.getTime() /
                    1000
                );

            if (
                payload.iat <
                passwordChangedAt
            ) {
                throw new ApiError(
                    401,
                    "Password was recently changed. Please log in again.",
                    [],
                    "PASSWORD_RECENTLY_CHANGED"
                );
            }
        }

        req.user = user;

        next();
    }
);

export const requireAdmin = (req, _res, next) => {
    if (!req.user || req.user.role !== "admin") {
        throw new ApiError(
            403,
            "Access denied. Admin role required.",
            [],
            "FORBIDDEN"
        );
    }
    next();
};