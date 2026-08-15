import { baseEmailLayout } from "./baseEmailLayout.js";

export const otpEmailTemplate = ({ name, otp, expiryMinutes = 10 } = {}) => {
    if (!otp) {
        throw new Error("OTP is required to generate verification email");
    }

    const safeName = typeof name === "string" && name.trim() ? name.trim() : "User";
    const safeExpiryMinutes = Number.isFinite(Number(expiryMinutes)) && Number(expiryMinutes) > 0 ? Number(expiryMinutes) : 10;

    const bodyHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            Verify Your Account
        </h2>

        <p style="margin: 0 0 20px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
            Hello <strong style="color: #ffffff;">${safeName}</strong>,
        </p>

        <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
            Use the verification code below to complete your registration and activate your SkillSwap AI account.
        </p>

        <!-- OTP BOX -->
        <div style="margin: 28px 0; padding: 24px; background: rgba(255, 90, 0, 0.06); border: 1px solid rgba(255, 90, 0, 0.25); border-radius: 16px; text-align: center;">
            <div style="font-size: 38px; font-weight: 800; color: #ff5a00; letter-spacing: 12px; font-family: monospace;">
                ${otp}
            </div>
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #f97316; font-weight: 500;">
                Expires in ${safeExpiryMinutes} minutes
            </p>
        </div>

        <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
            🔒 Security Notice: Never share this verification code with anyone. Our team will never ask for your code.
        </p>

        <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
            If you did not create a SkillSwap AI account, you can safely ignore this email.
        </p>
    `;

    return {
        subject: "Verify your SkillSwap AI account",
        text: `Hello ${safeName},\n\nYour SkillSwap AI verification code is: ${otp}\n\nThis code expires in ${safeExpiryMinutes} minutes.\nNever share this code with anyone.\n\nSkillSwap AI Team`,
        html: baseEmailLayout({
            title: "Verify your SkillSwap AI account",
            preheader: `Your verification code is ${otp}`,
            bodyHtml,
        }),
    };
};