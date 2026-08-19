import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";

import app, { allowedOrigins } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { verifyMailConnection } from "./config/mailer.js";
import socketAuthMiddleware from "./middleware/socketAuth.middleware.js";
import Chat from "./models/Chat.js";

let server;

async function startServer() {
    await connectDatabase();

    await verifyMailConnection();

    server = http.createServer(app);

    const io = new Server(server, {
        pingInterval: 25000,
        pingTimeout: 20000,
        maxHttpBufferSize: 1e6,
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);
                const cleanOrigin = origin.replace(/\/$/, "");
                if (allowedOrigins.includes(cleanOrigin)) {
                    return callback(null, true);
                }
                return callback(null, true);
            },
            credentials: true,
        },
    });

    app.set("io", io);
    global.io = io;

    // Apply Socket.io JWT Authentication Middleware
    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
        // Automatically joined to socket.userId on auth middleware
        
        socket.on("register_user", (userId) => {
            // Keep backwards compatibility while enforcing authenticated socket user ID
            if (socket.userId) {
                socket.join(socket.userId.toString());
            }
        });

        socket.on("join_chat", async (chatId) => {
            if (!chatId || !socket.userId) return;

            try {
                // Verify user is an authorized participant of the chat before joining room
                const isParticipant = await Chat.exists({
                    _id: chatId,
                    participants: socket.userId,
                });

                if (isParticipant) {
                    socket.join(chatId.toString());
                } else {
                    console.warn(`🔒 [UNAUTHORIZED SOCKET ROOM ACCESS] User ${socket.userId} attempted to join unauthorized chat ${chatId}`);
                }
            } catch (err) {
                console.error("Error verifying chat room access for socket:", err.message);
            }
        });

        socket.on("disconnect", () => {
            socket.removeAllListeners();
        });
    });

    server.listen(env.port, () => {
        console.log(
            `SkillSwap AI API running on port ${env.port}`
        );

        console.log(
            `Environment: ${env.nodeEnv}`
        );
    });
}


async function shutdown(signal) {
    console.log(
        `${signal} received. Closing server and background task queue...`
    );

    try {
        const { queueManager } = await import("./services/queueManager.js");
        await queueManager.shutdown(3000);
    } catch (err) {
        console.error("Error shutting down queueManager:", err);
    }

    if (server) {
        server.close(async () => {
            await mongoose.connection.close();

            console.log(
                "Server and database connections closed."
            );

            process.exit(0);
        });
    } else {
        await mongoose.connection.close();
        process.exit(0);
    }

    setTimeout(() => {
        console.error(
            "Forced shutdown after timeout."
        );

        process.exit(1);
    }, 10000).unref();
}

process.on("SIGTERM", () =>
    shutdown("SIGTERM")
);

process.on("SIGINT", () =>
    shutdown("SIGINT")
);

process.on(
    "unhandledRejection",
    (reason) => {
        console.error(
            "Unhandled promise rejection:",
            reason
        );
    }
);

process.on("uncaughtException", (error) => {
    console.error(
        "Uncaught exception:",
        error
    );

    process.exit(1);
});

startServer();
console.log("Restart triggered for env vars");