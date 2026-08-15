import { env } from "../config/env.js";
import { createMailTransporter, mailTransporter } from "../config/mailer.js";
import { otpEmailTemplate } from "../templates/otpEmail.template.js";

export async function sendVerificationOtpEmail({
    name,
    email,
    otp,
}) {
    const template = otpEmailTemplate({
        name,
        otp,
        expiryMinutes: env.otpExpiresInMinutes || 10,
    });

    const { subject, text, html } = template;

    const fromName = env.smtp?.fromName || env.MAIL_FROM_NAME || "SkillSwap AI";
    const fromAddress = env.smtp?.fromEmail || env.MAIL_FROM_ADDRESS || env.smtp?.user || process.env.SMTP_USER || "gohilraviiiii012@gmail.com";

    const mailOptions = {
        from: `"${fromName}" <${fromAddress}>`,
        to: email,
        subject,
        text,
        html,
        replyTo: fromAddress,
        envelope: {
            from: fromAddress,
            to: [email],
        },
        headers: {
            "X-Application": "SkillSwap AI",
        },
    };

    try {
        await mailTransporter.sendMail(mailOptions);
        console.log(`✅ [AUTH OTP EMAIL SENT] Successfully sent verification email to ${email}`);
    } catch (primaryError) {
        console.warn(`⚠️ [AUTH OTP EMAIL RETRYING] Primary transport failed (${primaryError.message}). Retrying with fresh transport connection...`);
        const freshTransporter = createMailTransporter();
        await freshTransporter.sendMail(mailOptions);
        console.log(`✅ [AUTH OTP EMAIL SENT ON RETRY] Successfully sent verification email to ${email}`);
    }
}

export async function sendOtpEmail({ email, name, otp }) {
    return sendVerificationOtpEmail({ email, name, otp });
}

/**
 * Enqueue OTP verification email for asynchronous non-blocking delivery
 */
export function queueVerificationOtpEmail({ name, email, otp }) {
    import("./queueManager.js").then(({ queueManager, JOB_TYPES }) => {
        queueManager.enqueue(JOB_TYPES.SEND_OTP_EMAIL, { name, email, otp });
    }).catch((err) => {
        console.error("Failed to enqueue OTP email, falling back to direct send:", err);
        sendVerificationOtpEmail({ name, email, otp }).catch(() => { });
    });
}

/**
 * Enqueue generic/contact email for asynchronous non-blocking delivery
 */
export function queueContactEmail({ to, subject, html, text, replyTo }) {
    import("./queueManager.js").then(({ queueManager, JOB_TYPES }) => {
        queueManager.enqueue(JOB_TYPES.SEND_CONTACT_EMAIL, { to, subject, html, text, replyTo });
    }).catch((err) => {
        console.error("Failed to enqueue contact email:", err);
    });
}
