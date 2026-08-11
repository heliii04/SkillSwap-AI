import mongoose from "mongoose";
import Report from "../models/Report.js";
import User from "../models/User.js";
import Skill from "../models/Skill.js";
import Message from "../models/Message.js";
import Contact from "../models/Contact.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/sendEmail.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Submit a report for a user, skill, or chat message
 */
export const createReport = asyncHandler(async (req, res) => {
    const { targetType, targetId, reportedUser, reason, description } = req.body;

    if (!targetType || !targetId || !reason || !description) {
        throw new ApiError(400, "Target type, target ID, reason, and description are required.");
    }

    if (!["user", "skill", "message", "chat"].includes(targetType)) {
        throw new ApiError(400, "Invalid target type.");
    }

    let finalReportedUser = reportedUser || null;

    if (!finalReportedUser) {
        if (targetType === "user") {
            finalReportedUser = targetId;
        } else if (targetType === "skill") {
            const skillObj = await Skill.findById(targetId);
            if (skillObj) finalReportedUser = skillObj.owner;
        } else if (targetType === "message") {
            const msgObj = await Message.findById(targetId);
            if (msgObj) finalReportedUser = msgObj.sender;
        }
    }

    const newReport = await Report.create({
        reporter: req.user._id,
        targetType,
        targetId,
        reportedUser: finalReportedUser,
        reason,
        description,
        status: "pending"
    });

    const populated = await Report.findById(newReport._id)
        .populate("reporter", "name email avatar")
        .populate("reportedUser", "name email avatar role accountStatus");

    return res.status(201).json({
        success: true,
        message: "Report submitted successfully. Our safety team will review it.",
        data: { report: populated }
    });
});

/**
 * Get current user's submitted reports
 */
export const getUserReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({ reporter: req.user._id })
        .populate("reportedUser", "name avatar")
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: { reports }
    });
});

/**
 * Admin: Get all reports with status & targetType filtering
 */
export const getAllReports = asyncHandler(async (req, res) => {
    const { status, targetType, limit = 50 } = req.query;

    const query = {};
    if (status && status !== "all") {
        query.status = status;
    }
    if (targetType && targetType !== "all") {
        query.targetType = targetType;
    }

    const reports = await Report.find(query)
        .populate("reporter", "name email avatar")
        .populate("reportedUser", "name email avatar role accountStatus")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

    return res.status(200).json({
        success: true,
        data: { reports, count: reports.length }
    });
});

/**
 * Admin: Update report status & take moderation action
 */
export const updateReportStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, actionTaken, adminNotes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
        throw new ApiError(404, "Report ticket not found.");
    }

    const updateFields = {
        resolvedAt: new Date()
    };

    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
        updateFields.resolvedBy = req.user._id;
    }

    if (status) updateFields.status = status;
    if (actionTaken) updateFields.actionTaken = actionTaken;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const updated = await Report.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: false }
    )
        .populate("reporter", "name email avatar")
        .populate("reportedUser", "name email avatar role accountStatus");

    // If moderation action is sending a warning notice to the reported user
    if (actionTaken === "warning_sent" && report.reportedUser) {
        try {
            await Notification.create({
                recipient: report.reportedUser,
                type: "system",
                title: "⚠️ Official Safety Warning",
                message: adminNotes || "You have received an official warning regarding a policy violation report. Please adhere to SkillSwap AI community guidelines.",
                link: "/help"
            });
        } catch (notifErr) {
            console.warn("Could not create in-app warning notification:", notifErr.message);
        }

        if (updated.reportedUser?.email) {
            try {
                await sendEmail({
                    to: updated.reportedUser.email,
                    subject: `[SkillSwap AI Safety Team] Warning: Policy Violation Notice`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e15; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid rgba(245,158,11,0.3);">
                            <h2 style="color: #f59e0b; margin-top: 0;">Official Community Guideline Warning</h2>
                            <p style="color: #e2e8f0; font-size: 15px;">Hello ${updated.reportedUser.name},</p>
                            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                Our safety and moderation team has reviewed a report regarding your activity on SkillSwap AI. This email serves as an official warning notice.
                            </p>
                            <div style="background: rgba(245,158,11,0.1); padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; font-size: 14px; color: #fde68a;"><strong>Warning Details:</strong> ${adminNotes || "Adhere to platform guidelines and maintain respectful communication with all members."}</p>
                            </div>
                            <p style="color: #94a3b8; font-size: 13px;">Repeated policy violations may result in temporary or permanent account suspension.</p>
                            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
                            <p style="color: #64748b; font-size: 12px; margin: 0;">SkillSwap AI Safety & Moderation Team</p>
                        </div>
                    `
                });
            } catch (warnMailErr) {
                console.warn("Could not send warning email:", warnMailErr.message);
            }
        }
    }

    // If moderation action is to suspend the user, update reported user's status
    if (actionTaken === "user_suspended" && report.reportedUser) {
        await User.findByIdAndUpdate(report.reportedUser, {
            accountStatus: "suspended",
            suspendedAt: new Date(),
            suspendedReason: adminNotes || `Suspended due to report #${report._id}`
        });

        if (updated.reportedUser?.email) {
            try {
                await sendEmail({
                    to: updated.reportedUser.email,
                    subject: `[SkillSwap AI Safety Team] Important: Account Moderation Notice`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e15; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid rgba(239,68,68,0.3);">
                            <h2 style="color: #ef4444; margin-top: 0;">Account Moderation Notice</h2>
                            <p style="color: #e2e8f0; font-size: 15px;">Hello ${updated.reportedUser.name},</p>
                            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                Your SkillSwap AI account status has been updated to <strong>Suspended</strong> following a safety & policy violation review.
                            </p>
                            <div style="background: rgba(239,68,68,0.1); padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #ef4444;">
                                <p style="margin: 0; font-size: 14px; color: #fca5a5;"><strong>Reason:</strong> ${adminNotes || `Violation report #${updated._id}`}</p>
                            </div>
                            <p style="color: #94a3b8; font-size: 13px;">If you believe this is an error or wish to appeal, please contact support@skillswap.ai.</p>
                        </div>
                    `
                });
            } catch (userMailErr) {
                console.warn("Could not send suspension notice email to reported user:", userMailErr.message);
            }
        }
    }

    // Send email notification to the reporter
    const reporterEmail = updated.reporter?.email || (await Contact.findById(updated.targetId))?.email;
    if (reporterEmail) {
        try {
            await sendEmail({
                to: reporterEmail,
                subject: `[SkillSwap AI Safety Team] Report #${updated._id.toString().slice(-6)} Status Update`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e15; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <h2 style="color: #f97316; margin-top: 0;">SkillSwap AI Moderation Update</h2>
                        <p style="color: #e2e8f0; font-size: 15px;">Hello,</p>
                        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                            Your report ticket regarding <strong>${updated.targetType}</strong> (Reason: <em>${updated.reason.replace("_", " ")}</em>) has been reviewed and processed by our moderation team.
                        </p>
                        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #f97316;">
                            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #38bdf8;">${updated.status.toUpperCase()}</span></p>
                            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Action Taken:</strong> ${updated.actionTaken || "None"}</p>
                            ${updated.adminNotes ? `<p style="margin: 0; font-size: 14px;"><strong>Moderation Notes:</strong> ${updated.adminNotes}</p>` : ""}
                        </div>
                        <p style="color: #94a3b8; font-size: 13px;">Thank you for helping keep SkillSwap AI safe and respectful for everyone.</p>
                        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
                        <p style="color: #64748b; font-size: 12px; margin: 0;">SkillSwap AI Safety & Moderation Team</p>
                    </div>
                `
            });
        } catch (repMailErr) {
            console.warn("Could not send status update email to reporter:", repMailErr.message);
        }
    }

    return res.status(200).json({
        success: true,
        message: "Report updated and notification email sent successfully",
        data: { report: updated }
    });
});
