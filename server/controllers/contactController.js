import Contact from "../models/Contact.js";
import { sendEmail } from "../utils/sendEmail.js";
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

    // Attempt to send email notification to admin/support
    try {
        await sendEmail({
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
    } catch (mailError) {
        console.warn("Could not send admin notification email:", mailError.message);
        // We do not fail the request if mail sending fails
    }

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

    if (status) {
        inquiry.status = status;
    }

    if (replyMessage) {
        inquiry.replyMessage = replyMessage;
        inquiry.repliedAt = new Date();
        inquiry.status = "resolved";

        // Attempt to send response email to the user
        try {
            await sendEmail({
                to: inquiry.email,
                subject: `Re: ${inquiry.subject} - Support Ticket Resolved`,
                html: `
                    <h2>SkillSwap AI Support Team Response</h2>
                    <p>Hello ${inquiry.name},</p>
                    <p>Our support team has responded to your inquiry:</p>
                    <blockquote style="border-left: 4px solid #f97316; padding-left: 15px; margin: 15px 0; color: #555;">
                        ${replyMessage.replace(/\n/g, "<br>")}
                    </blockquote>
                    <p>If you have further questions, feel free to reply or open another inquiry.</p>
                    <br />
                    <p>Best regards,</p>
                    <p><strong>SkillSwap AI Support</strong></p>
                `,
            });
        } catch (mailError) {
            console.warn("Could not send reply email to user:", mailError.message);
        }
    }

    await inquiry.save();

    res.status(200).json({
        success: true,
        message: "Support ticket updated successfully.",
        data: inquiry,
    });
});
