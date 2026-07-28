import http from "http";
import mongoose from "mongoose";

import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { verifyMailConnection } from "./config/mailer.js";

let server;

async function startServer() {
    await connectDatabase();

    await verifyMailConnection();

    server = http.createServer(app);

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
        `${signal} received. Closing server...`
    );

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

        shutdown("unhandledRejection");
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