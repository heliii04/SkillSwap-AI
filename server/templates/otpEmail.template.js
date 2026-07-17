export const otpEmailTemplate = (
  {
    name,
    otp,
    expiryMinutes = 10,
  } = {}
) => {
  if (!otp) {
    throw new Error(
      "OTP is required to generate verification email"
    );
  }

  const safeName =
    typeof name === "string" &&
      name.trim()
      ? name.trim()
      : "User";

  const safeExpiryMinutes =
    Number.isFinite(Number(expiryMinutes)) &&
      Number(expiryMinutes) > 0
      ? Number(expiryMinutes)
      : 10;

  const currentYear =
    new Date().getFullYear();

  return {
    subject:
      "Verify your SkillSwap AI account",

    text: `
Hello ${safeName},

Your SkillSwap AI verification code is: ${otp}

This code expires in ${safeExpiryMinutes} minutes.

Never share this verification code with anyone.

If you did not create a SkillSwap AI account, you can safely ignore this email.

SkillSwap AI Team
        `.trim(),

    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />

    <meta
        http-equiv="X-UA-Compatible"
        content="IE=edge"
    />

    <title>
        Verify your SkillSwap AI account
    </title>
</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f4f4f5;
        font-family: Arial, Helvetica, sans-serif;
        color: #18181b;
    "
>
    <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
            width: 100%;
            background-color: #f4f4f5;
            padding: 32px 16px;
        "
    >
        <tr>
            <td align="center">

                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                        width: 100%;
                        max-width: 560px;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        border: 1px solid #e4e4e7;
                        box-shadow:
                            0 8px 30px
                            rgba(0, 0, 0, 0.08);
                    "
                >
                    <tr>
                        <td
                            style="
                                background-color: #07080d;
                                padding: 28px 32px;
                                text-align: center;
                            "
                        >
                            <h1
                                style="
                                    margin: 0;
                                    color: #ffffff;
                                    font-size: 25px;
                                    line-height: 1.3;
                                    font-weight: 700;
                                "
                            >
                                SkillSwap
                                <span
                                    style="
                                        color: #ff5a00;
                                    "
                                >
                                    AI
                                </span>
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding: 36px 32px;
                            "
                        >
                            <h2
                                style="
                                    margin: 0 0 16px;
                                    font-size: 24px;
                                    line-height: 1.3;
                                    color: #18181b;
                                "
                            >
                                Verify your email address
                            </h2>

                            <p
                                style="
                                    margin: 0 0 20px;
                                    color: #52525b;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                            >
                                Hello ${safeName},
                            </p>

                            <p
                                style="
                                    margin: 0 0 24px;
                                    color: #52525b;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                            >
                                Use the verification code
                                below to complete your
                                SkillSwap AI registration.
                            </p>

                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    margin: 24px 0;
                                "
                            >
                                <tr>
                                    <td
                                        align="center"
                                        style="
                                            padding: 22px;
                                            border-radius: 12px;
                                            background-color: #fff7ed;
                                            border: 1px solid #fed7aa;
                                        "
                                    >
                                        <span
                                            style="
                                                display: inline-block;
                                                letter-spacing: 8px;
                                                font-size: 34px;
                                                font-weight: 700;
                                                color: #ff5a00;
                                            "
                                        >
                                            ${otp}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <p
                                style="
                                    margin: 24px 0 0;
                                    color: #71717a;
                                    font-size: 14px;
                                    line-height: 1.6;
                                "
                            >
                                This verification code
                                expires in
                                <strong>
                                    ${safeExpiryMinutes}
                                    minutes
                                </strong>.
                            </p>

                            <p
                                style="
                                    margin: 12px 0 0;
                                    color: #71717a;
                                    font-size: 14px;
                                    line-height: 1.6;
                                "
                            >
                                Never share this code
                                with anyone.
                            </p>

                            <p
                                style="
                                    margin: 20px 0 0;
                                    color: #71717a;
                                    font-size: 14px;
                                    line-height: 1.6;
                                "
                            >
                                If you did not create a
                                SkillSwap AI account,
                                you can safely ignore this
                                email.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding: 20px 32px;
                                background-color: #fafafa;
                                text-align: center;
                                color: #a1a1aa;
                                font-size: 12px;
                                line-height: 1.5;
                            "
                        >
                            © ${currentYear}
                            SkillSwap AI.
                            All rights reserved.
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
        `.trim(),
  };
};