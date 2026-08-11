import nodemailer from "nodemailer";
import { env } from "./env.js";

export function createMailTransporter() {
    const rawUser = env.SMTP_USER || process.env.SMTP_USER || "";
    const rawPass = env.SMTP_PASS || process.env.SMTP_PASSWORD || "";

    const user = rawUser.trim();
    // Gmail App Passwords often contain spaces (e.g. "csuf whun vkcx fppm").
    // Stripping spaces ensures authentication succeeds in SMTP PLAIN auth.
    const pass = rawPass.trim().replace(/\s+/g, "");

    const smtpHost = (env.SMTP_HOST || process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const smtpPort = Number(env.SMTP_PORT || process.env.SMTP_PORT) || 465;

    const isGmail = smtpHost.includes("gmail") || user.endsWith("@gmail.com");

    if (isGmail && user && pass) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user,
                pass,
            },
            connectionTimeout: 20000,
            greetingTimeout: 20000,
            socketTimeout: 30000,
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    const isSecure = process.env.SMTP_SECURE !== undefined
        ? String(process.env.SMTP_SECURE).trim() === "true"
        : smtpPort === 465;

    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
            user,
            pass,
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
        tls: {
            rejectUnauthorized: false,
        },
    });
}

export const mailTransporter = createMailTransporter();

export async function verifyMailConnection() {
    try {
        const user = env.SMTP_USER || process.env.SMTP_USER;
        const pass = env.SMTP_PASS || process.env.SMTP_PASSWORD;

        if (!user || !pass) {
            console.warn(
                "\n⚠️ [SMTP WARNING] SMTP_USER or SMTP_PASSWORD missing! Live email sending will fail until set in Render Dashboard Environment Variables.\n"
            );
            return false;
        }

        const transporter = createMailTransporter();
        await transporter.verify();
        console.log("✅ [SMTP CONNECTED] SMTP server connection verified successfully.");
        return true;
    } catch (error) {
        console.error(
            "❌ [SMTP ERROR] SMTP verification failed:",
            error.message
        );
        return false;
    }
}