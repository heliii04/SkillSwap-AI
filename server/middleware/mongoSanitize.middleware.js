/**
 * Recursively strips keys starting with '$' or containing '.' from objects and arrays
 * to neutralize MongoDB NoSQL Injection attack vectors.
 */
function sanitize(target) {
    if (!target || typeof target !== "object") {
        return target;
    }

    if (Array.isArray(target)) {
        for (let i = 0; i < target.length; i++) {
            sanitize(target[i]);
        }
        return target;
    }

    for (const key of Object.keys(target)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete target[key];
        } else {
            sanitize(target[key]);
        }
    }

    return target;
}

/**
 * Express middleware for MongoDB NoSQL Injection Protection
 */
export function mongoSanitizeMiddleware(req, _res, next) {
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
}
