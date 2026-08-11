import nodemailer from "nodemailer";
import { env } from "./env.js";

const user = env.smtp?.user || env.SMTP_USER || process.env.SMTP_USER;
const pass = env.smtp?.password || env.SMTP_PASS || process.env.SMTP_PASSWORD;
const host = env.smtp?.host || env.SMTP_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(env.smtp?.port || env.SMTP_PORT || process.env.SMTP_PORT) || 587;

export const mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: {
        user,
        pass,
    },
    tls: {
        rejectUnauthorized: false,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
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