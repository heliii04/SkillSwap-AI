import { env } from "../config/env.js";
import { mailTransporter } from "../config/mailer.js";

export async function sendVerificationOtpEmail({
    name,
    email,
    otp,
}) {
    const subject = "Verify your SkillSwap AI account";

    const text = `
Hello ${name},

Your SkillSwap AI verification code is: ${otp}

This code expires in ${env.otpExpiresInMinutes} minutes.

Do not share this OTP with anyone.

SkillSwap AI
    `.trim();

    const html = `
        <div style="
            max-width: 560px;
            margin: 0 auto;
            padding: 32px;
            background: #0b0b0b;
            color: #ffffff;
            font-family: Arial, sans-serif;
            border-radius: 18px;
            border: 1px solid #292929;
        ">
            <h1 style="
                margin: 0;
                color: #f97316;
                font-size: 26px;
            ">
                SkillSwap AI
            </h1>

            <p style="
                margin-top: 28px;
                color: #d4d4d4;
                line-height: 1.7;
            ">
                Hello ${name},
            </p>

            <p style="
                color: #d4d4d4;
                line-height: 1.7;
            ">
                Use the following verification code to
                activate your account:
            </p>

            <div style="
                margin: 28px 0;
                padding: 18px;
                background: #171717;
                color: #fb923c;
                font-size: 34px;
                font-weight: bold;
                text-align: center;
                letter-spacing: 10px;
                border-radius: 12px;
                border: 1px solid #431407;
            ">
                ${otp}
            </div>

            <p style="
                color: #a3a3a3;
                line-height: 1.7;
            ">
                This code expires in
                ${env.otpExpiresInMinutes} minutes.
            </p>

            <p style="
                color: #a3a3a3;
                line-height: 1.7;
            ">
                Never share your password or OTP with
                anyone.
            </p>
        </div>
    `;

    const fromName = env.smtp?.fromName || env.MAIL_FROM_NAME || "SkillSwap AI";
    const fromAddress = env.smtp?.fromEmail || env.MAIL_FROM_ADDRESS || env.smtp?.user || process.env.SMTP_USER || "gohilraviiiii012@gmail.com";

    await mailTransporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: email,
        subject,
        text,
        html,
    });
}

export async function sendOtpEmail({ email, name, otp }) {
    return sendVerificationOtpEmail({ email, name, otp });
}