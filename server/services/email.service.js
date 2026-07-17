import transporter from "../config/mailer.js";
import { otpEmailTemplate } from "../templates/otpEmail.template.js";

const MAIL_FROM_NAME =
    process.env.MAIL_FROM_NAME || "SkillSwap AI";

const MAIL_FROM_ADDRESS =
    process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;

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

    if (!MAIL_FROM_ADDRESS) {
        throw new Error(
            "MAIL_FROM_ADDRESS or SMTP_USER is not configured"
        );
    }

    try {
        const info = await transporter.sendMail({
            from: {
                name: MAIL_FROM_NAME,
                address: MAIL_FROM_ADDRESS,
            },
            to,
            subject,
            text,
            html,
            replyTo,
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

        throw new Error(
            "Unable to send email at the moment"
        );
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