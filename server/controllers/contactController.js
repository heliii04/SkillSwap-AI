import Contact from "../models/Contact.js";
import Report from "../models/Report.js";
import { sendEmail } from "../utils/sendEmail.js";
import { queueContactEmail } from "../services/email.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { baseEmailLayout } from "../templates/baseEmailLayout.js";

// @desc    Submit a new contact inquiry
// @route   POST /api/contact
// @access  Public
export const submitContactInquiry = asyncHandler(async (req, res) => {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !category || !message) {
        throw new ApiError(400, "All fields are required.");
    }

    const inquiry = await Contact.create({
        name,
        email,
        subject,
        category,
        message,
    });

    if (category === "safety") {
        try {
            const lowerText = `${subject} ${message}`.toLowerCase();
            let autoReason = "other";
            if (lowerText.includes("spam")) autoReason = "spam";
            else if (lowerText.includes("fake")) autoReason = "fake_profile";
            else if (lowerText.includes("harass") || lowerText.includes("abuse") || lowerText.includes("inappropriate")) autoReason = "harassment";
            else if (lowerText.includes("scam")) autoReason = "scam";

            await Report.create({
                reporter: req.user?._id || inquiry._id,
                targetType: "user",
                targetId: inquiry._id,
                reason: autoReason,
                description: `[Support Ticket] ${subject}: ${message}`,
                status: "pending"
            });
        } catch (repError) {
            console.warn("Could not auto-create report from safety contact form:", repError.message);
        }
    }

    // Enqueue admin email notification to background queue for non-blocking submission
    queueContactEmail({
        to: process.env.SUPPORT_EMAIL || "support@skillswap.ai",
        subject: `[New Support Ticket] - ${subject}`,
        html: baseEmailLayout({
            title: "New Support Inquiry Received",
            preheader: `New ticket from ${name}: ${subject}`,
            bodyHtml: `
                <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                    New Support Inquiry Received
                </h2>
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;"><strong style="color: #ffffff;">Name:</strong> ${name}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;"><strong style="color: #ffffff;">Email:</strong> ${email}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;"><strong style="color: #ffffff;">Category:</strong> ${category}</p>
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1;"><strong style="color: #ffffff;">Subject:</strong> ${subject}</p>
                </div>
                <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #ff5a00;">Message Content:</h3>
                <div style="background: rgba(255,90,0,0.05); border-left: 4px solid #ff5a00; padding: 16px; border-radius: 8px; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
                    ${message.replace(/\n/g, "<br>")}
                </div>
            `
        }),
    });

    res.status(201).json({
        success: true,
        message: "Your message has been submitted successfully.",
        data: inquiry,
    });
});

// @desc    Get all contact inquiries
// @route   GET /api/contact
// @access  Private (Admin)
export const getAllContactInquiries = asyncHandler(async (req, res) => {
    // Auto-revert any ticket that was marked "resolved" without an actual reply/email sent to the user
    await Contact.updateMany(
        { status: "resolved", $or: [{ replyMessage: { $exists: false } }, { replyMessage: "" }, { replyMessage: null }] },
        { $set: { status: "pending" } }
    );

    // Sync any reports status back to Contact inquiries (e.g. if resolved/dismissed from moderation panel)
    const safetyReports = await Report.find({ targetId: { $ne: null } });
    for (const rep of safetyReports) {
        if (rep.targetId && rep.status) {
            await Contact.updateOne(
                { _id: rep.targetId, status: { $ne: rep.status } },
                {
                    $set: {
                        status: rep.status,
                        ...(rep.adminNotes ? { replyMessage: rep.adminNotes, repliedAt: rep.resolvedAt || new Date() } : {})
                    }
                }
            );
        }
    }

    const { status, category, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status) {
        filter.status = status;
    }
    if (category) {
        filter.category = category;
    }

    const skipIndex = (page - 1) * limit;

    const inquiries = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skipIndex);

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: inquiries,
        pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Update contact inquiry status or reply
// @route   PATCH /api/contact/:id
// @access  Private (Admin)
export const updateInquiryStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, replyMessage } = req.body;

    const inquiry = await Contact.findById(id);

    if (!inquiry) {
        throw new ApiError(404, "Inquiry ticket not found.");
    }

    const isResolving = status === "resolved" || Boolean(replyMessage?.trim());

    if (isResolving) {
        const messageToSend = replyMessage?.trim() || inquiry.replyMessage || "Your support inquiry has been reviewed and resolved by our team.";

        if (!inquiry.email) {
            throw new ApiError(400, "Cannot resolve inquiry: user email address is missing.");
        }

        // Email MUST be sent successfully before marking as resolved
        try {
            await sendEmail({
                to: inquiry.email,
                subject: `Re: ${inquiry.subject} - Support Ticket Resolved`,
                html: baseEmailLayout({
                    title: "Support Ticket Response",
                    preheader: `Re: ${inquiry.subject}`,
                    bodyHtml: `
                        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ff5a00;">
                            Support Team Response
                        </h2>
                        <p style="margin: 0 0 16px 0; font-size: 15px; color: #cbd5e1;">
                            Hello <strong style="color: #ffffff;">${inquiry.name}</strong>,
                        </p>
                        <p style="margin: 0 0 16px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                            Our support team has reviewed and responded to your inquiry regarding <strong>"${inquiry.subject}"</strong>:
                        </p>
                        <div style="background: rgba(255,90,0,0.06); border-left: 4px solid #ff5a00; border-radius: 12px; padding: 20px; margin: 20px 0; color: #ffffff; font-size: 15px; line-height: 1.7;">
                            ${messageToSend.replace(/\n/g, "<br>")}
                        </div>
                        <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                            If you have further questions, feel free to reply to this email or submit a new inquiry on SkillSwap AI.
                        </p>
                    `
                }),
            });
        } catch (mailError) {
            console.error("Could not send reply email to user:", mailError.message);
            throw new ApiError(
                500,
                `Failed to send email to ${inquiry.email} (${mailError.message}). Ticket status was NOT marked as resolved.`
            );
        }

        if (replyMessage?.trim()) {
            inquiry.replyMessage = replyMessage.trim();
            inquiry.repliedAt = new Date();
        }
        inquiry.status = "resolved";
    } else if (status) {
        inquiry.status = status;
    }

    await inquiry.save();

    // Bi-directionally sync with linked Report document if one exists
    try {
        await Report.updateMany(
            { targetId: inquiry._id },
            {
                $set: {
                    status: inquiry.status,
                    adminNotes: replyMessage || inquiry.replyMessage || "",
                    resolvedAt: new Date()
                }
            }
        );
    } catch (reportSyncErr) {
        console.warn("Could not sync Report status from Contact update:", reportSyncErr.message);
    }

    res.status(200).json({
        success: true,
        message: "Support ticket updated and response email sent successfully.",
        data: inquiry,
    });
});
