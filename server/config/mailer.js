import nodemailer from "nodemailer";
import { env } from "./env.js";

export const mailTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "smtp.gmail.com",
    port: Number(env.SMTP_PORT) || 465,
    secure: env.SMTP_SECURE !== false,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export async function verifyMailConnection() {
    try {
        await mailTransporter.verify();
        console.log("SMTP server connected successfully");
    } catch (error) {
        console.error(
            "SMTP connection failed:",
            error.message
        );
    }
}