import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export function notFoundHandler(req, _res, next) {
    next(
        new ApiError(
            404,
            `Route not found: ${req.method} ${req.originalUrl}`,
            [],
            "ROUTE_NOT_FOUND"
        )
    );
}

export function errorHandler(
    error,
    req,
    res,
    _next
) {
    let normalizedError = error;

    if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(
            error.errors
        ).map((item) => ({
            field: item.path,
            message: item.message,
        }));

        normalizedError = new ApiError(
            422,
            "Database validation failed.",
            errors,
            "DATABASE_VALIDATION_ERROR"
        );
    }

    if (error?.code === 11000) {
        normalizedError = new ApiError(
            409,
            "A record with this information already exists.",
            [],
            "DUPLICATE_RESOURCE"
        );
    }

    const statusCode =
        normalizedError.statusCode || 500;

    const isProduction =
        process.env.NODE_ENV === "production";

    // Structured error logging with request context
    if (statusCode >= 500) {
        logger.error(`Unhandled API Error: ${normalizedError.message}`, normalizedError, {
            requestId: req?.requestId,
            method: req?.method,
            path: req?.originalUrl || req?.url,
            userId: req?.user?._id?.toString() || null,
            statusCode,
        });
    } else {
        logger.warn(`API Warning (${statusCode}): ${normalizedError.message}`, {
            requestId: req?.requestId,
            method: req?.method,
            path: req?.originalUrl || req?.url,
            statusCode,
        });
    }

    res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500 && isProduction
                ? "An unexpected server error occurred."
                : normalizedError.message,

        code:
            normalizedError.code ||
            "INTERNAL_SERVER_ERROR",

        errors: normalizedError.errors || [],

        ...(!isProduction &&
            normalizedError.stack && {
            stack: normalizedError.stack,
        }),
    });
}

export const globalErrorHandler = errorHandler;