import { mailTransporter } from "../config/mailer.js";
import { env } from "../config/env.js";
import { otpEmailTemplate } from "../templates/otpEmail.template.js";

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
    replyTo,
}) => {
    if (!to) {
        throw new Error("Email recipient is required");
    }

    const fromName = env.MAIL_FROM_NAME || env.smtp?.fromName || "SkillSwap AI";
    const fromAddress = env.MAIL_FROM_ADDRESS || env.smtp?.user || process.env.SMTP_USER || "gohilraviiiii012@gmail.com";

    // Auto-generate clean plain text fallback if not provided
    const plainTextBody = text || (html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "");

    try {
        const recipientList = Array.isArray(to) ? to : [to];
        const info = await mailTransporter.sendMail({
            from: `"${fromName}" <${fromAddress}>`,
            to,
            subject,
            text: plainTextBody,
            html,
            replyTo: replyTo || fromAddress,
            envelope: {
                from: fromAddress,
                to: recipientList,
            },
            headers: {
                "X-Application": "SkillSwap AI",
            },
        });

        return {
            success: true,
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
        };
    } catch (error) {
        console.error("Email sending failed:", {
            message: error.message,
            code: error.code,
            command: error.command,
        });

        throw new Error("Unable to send email at the moment");
    }
};

export const sendOtpEmail = async ({
    to,
    name,
    otp,
    expiryMinutes = 10,
}) => {
    const template = otpEmailTemplate({
        name,
        otp,
        expiryMinutes,
    });

    return sendEmail({
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
    });
};