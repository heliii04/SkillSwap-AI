import nodemailer from "nodemailer";
import { env } from "./env.js";

export const mailTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export async function verifyMailConnection() {
    try {
        await mailTransporter.verify();
        console.log("SMTP server connected");
    } catch (error) {
        console.error(
            "SMTP connection failed:",
            error.message
        );
    }
}