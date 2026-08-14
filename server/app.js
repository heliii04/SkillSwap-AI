import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import compression from "compression";

import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import swapRequestRoutes from "./routes/swapRequest.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import matchRoutes from "./routes/match.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/report.routes.js";

import {
    errorHandler,
    notFoundHandler,
} from "./middleware/error.middleware.js";
import { requestLoggerMiddleware } from "./middleware/requestLogger.middleware.js";
import { mongoSanitizeMiddleware } from "./middleware/mongoSanitize.middleware.js";

const app = express();

app.set("trust proxy", 1);
app.use(requestLoggerMiddleware);

app.use(
    compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers["x-no-compression"]) {
                return false;
            }
            return compression.filter(req, res);
        },
    })
);

app.use(helmet());

const defaultOrigins = [
    "https://skillswap-ai-community.netlify.app",
    "http://localhost:5173",
    "http://localhost:5000",
    "http://localhost:3000",
];

const envOrigins = env.clientUrl
    ? env.clientUrl.split(",").map((url) => url.trim().replace(/\/$/, ""))
    : [];

export const allowedOrigins = Array.from(
    new Set([...defaultOrigins, ...envOrigins].filter(Boolean))
);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            const cleanOrigin = origin.replace(/\/$/, "");
            if (allowedOrigins.includes(cleanOrigin) || /\.netlify\.app$/.test(cleanOrigin)) {
                return callback(null, origin);
            }
            return callback(null, origin);
        },
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PATCH",
            "PUT",
            "DELETE",
            "OPTIONS",
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

app.use(
    express.json({
        limit: "15mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "15mb",
    })
);

app.use(cookieParser());
app.use(mongoSanitizeMiddleware);

if (!env.isProduction) {
    app.use(morgan("dev"));
}

app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.all(["/", "/health", "/api/health", "/api/v1/health"], (_req, res) => {
    res.status(200).json({
        success: true,
        message: "SkillSwap AI API is running.",
        timestamp: new Date().toISOString(),
    });
});

// Routes configuration
app.use("/api/v1/auth", authRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/v1/profile", profileRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/v1/skills", skillRoutes);
app.use("/api/skills", skillRoutes);
app.use(
    "/api/v1/swap-requests",
    swapRequestRoutes
);
app.use(
    "/api/swap-requests",
    swapRequestRoutes
);

app.use(
    "/api/v1/chats",
    chatRoutes
);
app.use(
    "/api/chats",
    chatRoutes
);

app.use(
    "/api/v1/notifications",
    notificationRoutes
);
app.use(
    "/api/notifications",
    notificationRoutes
);

app.use("/api/v1/matches", matchRoutes);
app.use("/api/matches", matchRoutes);

app.use("/api/v1/ai", aiRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/v1/contact", contactRoutes);
app.use("/api/contact", contactRoutes);

app.use("/api/v1/admin", adminRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/v1/reports", reportRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;