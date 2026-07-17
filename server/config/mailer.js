import nodemailer from "nodemailer";
import { env } from "./env.js";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,

    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },

    pool: env.NODE_ENV === "production",
    maxConnections: 5,
    maxMessages: 100,

    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,

    tls: {
        minVersion: "TLSv1.2",
    },
});

export const verifyEmailTransporter = async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP server connection verified");
        return true;
    } catch (error) {
        console.error("❌ SMTP verification failed:", error.message);
        return false;
    }
};

export default transporter;