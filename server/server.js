import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import connectDB from "./config/db.js";
import { verifyEmailTransporter } from "./config/mailer.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:5173",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Postman, mobile apps aur server-to-server requests me
            // origin undefined ho sakta hai.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json({ limit: "10kb" }));
app.use(
    express.urlencoded({
        extended: true,
        limit: "10kb",
    })
);
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SkillSwap AI Backend Running 🚀",
        environment: process.env.NODE_ENV || "development",
    });
});

// Unknown route handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error("Global error:", {
        message: error.message,
        stack:
            process.env.NODE_ENV === "development"
                ? error.stack
                : undefined,
    });

    res.status(error.statusCode || 500).json({
        success: false,
        message:
            error.message || "Internal server error",
    });
});

const PORT = Number(process.env.PORT) || 5000;

let server;

const startServer = async () => {
    try {
        // Database connection
        await connectDB();
        console.log("✅ Database connected successfully");

        // SMTP connection verification
        const smtpReady = await verifyEmailTransporter();

        if (!smtpReady) {
            console.warn(
                "⚠️ Server will start, but email delivery is currently unavailable"
            );
        }

        server = app.listen(PORT, () => {
            console.log(
                `🚀 Server running on http://localhost:${PORT}`
            );
            console.log(
                `📦 Environment: ${process.env.NODE_ENV || "development"
                }`
            );
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error.message);
        process.exit(1);
    }
};

const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    if (!server) {
        process.exit(0);
    }

    server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
    }, 10_000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (error) => {
    console.error("❌ Unhandled promise rejection:", error);

    if (server) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught exception:", error);
    process.exit(1);
});

startServer();