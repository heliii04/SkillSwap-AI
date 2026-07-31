import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import swapRequestRoutes from "./routes/swapRequest.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import adminRoutes from "./routes/adminRoutes.js";

import {
    errorHandler,
    notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
    cors({
        origin: env.clientUrl,
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
        limit: "20kb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "20kb",
    })
);

app.use(cookieParser());

if (!env.isProduction) {
    app.use(morgan("dev"));
}

app.get("/api/v1/health", (_req, res) => {
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

app.use("/api/v1/contact", contactRoutes);
app.use("/api/contact", contactRoutes);

app.use("/api/v1/admin", adminRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;