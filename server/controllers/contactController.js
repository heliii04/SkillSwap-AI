import Contact from "../models/Contact.js";
import Report from "../models/Report.js";
import { sendEmail } from "../utils/sendEmail.js";
import { queueContactEmail } from "../services/email.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
        html: `
            <h2>New Support Inquiry Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
        `,
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
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e15; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid rgba(249,115,22,0.3);">
                        <h2 style="color: #f97316; margin-top: 0;">SkillSwap AI Support Team Response</h2>
                        <p style="color: #e2e8f0; font-size: 15px;">Hello ${inquiry.name},</p>
                        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Our support team has reviewed and responded to your inquiry:</p>
                        <blockquote style="border-left: 4px solid #f97316; padding-left: 15px; margin: 15px 0; color: #e2e8f0; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                            ${messageToSend.replace(/\n/g, "<br>")}
                        </blockquote>
                        <p style="color: #94a3b8; font-size: 13px;">If you have further questions, feel free to reply to this email or submit a new inquiry on SkillSwap AI.</p>
                        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
                        <p style="color: #64748b; font-size: 12px; margin: 0;">Best regards,<br /><strong>SkillSwap AI Support Team</strong></p>
                    </div>
                `,
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
