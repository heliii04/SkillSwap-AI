/**
 * SkillSwap AI Base Email Theme Layout
 * Generates an ultra-premium dark theme email template matching the website UI/UX design.
 */
export const baseEmailLayout = ({ title, preheader, bodyHtml }) => {
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${title || "SkillSwap AI"}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0e15; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
    ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>` : ""}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background-color: #0d0e15; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 580px;">
                    
                    <!-- BRAND HEADER -->
                    <tr>
                        <td align="center" style="padding-bottom: 24px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, #ff5a00 0%, #ff7b00 100%); padding: 10px 14px; border-radius: 14px; box-shadow: 0 4px 20px rgba(255,90,0,0.3);">
                                        <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase;">
                                            S
                                        </span>
                                    </td>
                                    <td style="padding-left: 12px;">
                                        <span style="font-size: 22px; font-weight: 700; color: #ffffff; tracking: -0.5px;">
                                            SkillSwap <span style="color: #ff5a00;">AI</span>
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- MAIN CARD CONTAINER -->
                    <tr>
                        <td>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; background-color: #121319; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
                                
                                <!-- ORANGE GLOW ACCENT BAR -->
                                <tr>
                                    <td style="height: 4px; background: linear-gradient(90deg, #ff5a00 0%, #ff8700 50%, #ff5a00 100%);"></td>
                                </tr>

                                <!-- CARD CONTENT -->
                                <tr>
                                    <td style="padding: 36px 32px;">
                                        ${bodyHtml}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td align="center" style="padding-top: 32px; padding-bottom: 16px;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #94a3b8;">
                                SkillSwap AI — Learn, Teach & Swap Skills Worldwide
                            </p>
                            <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                                Empowering collaborative learning through AI matching.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #475569;">
                                &copy; ${year} SkillSwap AI. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};
