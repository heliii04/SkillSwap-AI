import dotenv from "dotenv";

dotenv.config();

const requiredVariables = [
    "MONGODB_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM_EMAIL",
    "CLIENT_URL",
];

for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        throw new Error(
            `Missing required environment variable: ${variable}`
        );
    }
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,

    clientUrl: process.env.CLIENT_URL,

    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidMailto: process.env.VAPID_MAILTO || "mailto:support@skillswap.ai",

    mongodbUri: process.env.MONGODB_URI,

    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

    jwtAccessExpiresIn:
        process.env.JWT_ACCESS_EXPIRES_IN || "15m",

    jwtRefreshExpiresInDays:
        Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) || 30,

    otpExpiresInMinutes:
        Number(process.env.OTP_EXPIRES_IN_MINUTES) || 10,

    bcryptSaltRounds:
        Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        fromName:
            process.env.SMTP_FROM_NAME || "SkillSwap AI",
        fromEmail: process.env.SMTP_FROM_EMAIL,
    },

    ai: {
        // AI stays optional: every feature has a rule-based fallback.
        enabled: process.env.AI_ENABLED !== "false",
        apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "",

        baseUrl:
            process.env.AI_BASE_URL ||
            "https://openrouter.ai/api/v1",

        model:
            process.env.AI_MODEL || "openai/gpt-4o-mini",

        timeoutMs:
            Number(process.env.AI_TIMEOUT_MS) || 20000,

        cacheTtlMs:
            Number(process.env.AI_CACHE_TTL_MINUTES || 60) * 60 * 1000,

        breakerThreshold:
            Number(process.env.AI_BREAKER_THRESHOLD) || 3,

        breakerCooldownMs:
            Number(process.env.AI_BREAKER_COOLDOWN_MINUTES || 5) *
            60 *
            1000,
    },

    isProduction: process.env.NODE_ENV === "production",

    // Backwards compatibility mappings
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGODB_URI,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_SECURE: process.env.SMTP_SECURE === "true",
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASSWORD,
    MAIL_FROM_NAME: process.env.SMTP_FROM_NAME || "SkillSwap AI",
    MAIL_FROM_ADDRESS: process.env.SMTP_FROM_EMAIL,
};