import { env } from "../config/env.js";

const isDev = env.nodeEnv === "development";

/**
 * Formats log messages into structured JSON objects
 */
function formatLog(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logObj = {
        timestamp,
        level,
        message,
        ...meta,
    };

    if (meta.error && meta.error instanceof Error) {
        logObj.error = {
            message: meta.error.message,
            name: meta.error.name,
            stack: meta.error.stack,
        };
    }

    return isDev ? JSON.stringify(logObj, null, 2) : JSON.stringify(logObj);
}

const logger = {
    info: (message, meta = {}) => {
        console.log(formatLog("INFO", message, meta));
    },
    warn: (message, meta = {}) => {
        console.warn(formatLog("WARN", message, meta));
    },
    error: (message, error = null, meta = {}) => {
        const errorMeta = error ? { error, ...meta } : meta;
        console.error(formatLog("ERROR", message, errorMeta));
    },
    debug: (message, meta = {}) => {
        if (isDev) {
            console.log(formatLog("DEBUG", message, meta));
        }
    },
};

export default logger;
