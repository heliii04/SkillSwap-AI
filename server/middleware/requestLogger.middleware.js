import logger from "../utils/logger.js";

/**
 * HTTP Request Timing & Correlation ID Middleware
 * Assigns a unique X-Request-ID header and records structured log metrics.
 */
export const requestLoggerMiddleware = (req, res, next) => {
    const start = Date.now();
    const requestId =
        req.headers["x-request-id"] ||
        `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    req.requestId = requestId;
    res.setHeader("X-Request-ID", requestId);

    res.on("finish", () => {
        const latencyMs = Date.now() - start;
        const statusCode = res.statusCode;

        const logData = {
            requestId,
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode,
            latencyMs,
            ip: req.ip || req.socket.remoteAddress,
            userId: req.user?._id?.toString() || null,
        };

        if (statusCode >= 500) {
            logger.error(`HTTP ${req.method} ${logData.path} - Server Error ${statusCode}`, null, logData);
        } else if (statusCode >= 400) {
            logger.warn(`HTTP ${req.method} ${logData.path} - ${statusCode}`, logData);
        } else {
            logger.info(`HTTP ${req.method} ${logData.path} - ${statusCode} (${latencyMs}ms)`, logData);
        }
    });

    next();
};
