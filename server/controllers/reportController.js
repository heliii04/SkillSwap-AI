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

    const report = await Report.findById(id)
        .populate("reporter", "name email avatar")
        .populate("reportedUser", "name email avatar role accountStatus");

    if (!report) {
        throw new ApiError(404, "Report ticket not found.");
    }

    const targetStatus = status || report.status;
    const targetAction = actionTaken || report.actionTaken || "none";
    const notes = adminNotes !== undefined ? adminNotes : (report.adminNotes || "");

    // Identify reporter email
    let reporterEmail = report.reporter?.email;
    if (!reporterEmail && report.targetId) {
        const contactTicket = await Contact.findById(report.targetId);
        if (contactTicket && contactTicket.email) {
            reporterEmail = contactTicket.email;
        }
    }

    // 1. If moderation action is warning_sent, handle in-app notification & warning email
    if (targetAction === "warning_sent" && report.reportedUser) {
        try {
            await Notification.create({
                recipient: report.reportedUser._id || report.reportedUser,
                type: "system",
                title: "⚠️ Official Safety Warning",
                message: notes || "You have received an official warning regarding a policy violation report. Please adhere to SkillSwap AI community guidelines.",
                link: "/help"
            });
        } catch (notifErr) {
            console.warn("Could not create in-app warning notification:", notifErr.message);
        }

        if (report.reportedUser?.email) {
            try {
                await sendEmail({
                    to: report.reportedUser.email,
                    subject: `[SkillSwap AI Safety Team] Warning: Policy Violation Notice`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e15; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid rgba(245,158,11,0.3);">
                            <h2 style="color: #f59e0b; margin-top: 0;">Official Community Guideline Warning</h2>
                            <p style="color: #e2e8f0; font-size: 15px;">Hello ${report.reportedUser.name},</p>
                            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                Our safety and moderation team has reviewed a report regarding your activity on SkillSwap AI. This email serves as an official warning notice.
                            </p>
                            <div style="background: rgba(245,158,11,0.1); padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; font-size: 14px; color: #fde68a;"><strong>Warning Details:</strong> ${notes || "Adhere to platform guidelines and maintain respectful communication with all members."}</p>
                            </div>
                            <p style="color: #94a3b8; font-size: 13px;">Repeated policy violations may result in temporary or permanent account suspension.</p>
                            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
                            <p style="color: #64748b; font-size: 12px; margin: 0;">SkillSwap AI Safety & Moderation Team</p>
                        </div>
                    `
                });
            } catch (warnMailErr) {
                console.error("Could not send warning email:", warnMailErr.message);
                throw new ApiError(500, `Failed to send warning email to ${report.reportedUser.email}: ${warnMailErr.message}. Report status was NOT updated.`);
            }
        }
    }

    // 2. If moderation action is user_suspended, update user status & send suspension email
    if (targetAction === "user_suspended" && report.reportedUser) {
        if (report.reportedUser?.email) {
            try {
                await sendEmail({
                    to: report.reportedUser.email,
                    subject: `[SkillSwap AI Safety Team] Important: Account Moderation Notice`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e15; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid rgba(239,68,68,0.3);">
                            <h2 style="color: #ef4444; margin-top: 0;">Account Moderation Notice</h2>
                            <p style="color: #e2e8f0; font-size: 15px;">Hello ${report.reportedUser.name},</p>
                            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                Your SkillSwap AI account status has been updated to <strong>Suspended</strong> following a safety & policy violation review.
                            </p>
                            <div style="background: rgba(239,68,68,0.1); padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid #ef4444;">
                                <p style="margin: 0; font-size: 14px; color: #fca5a5;"><strong>Reason:</strong> ${notes || `Violation report #${report._id}`}</p>
                            </div>
                            <p style="color: #94a3b8; font-size: 13px;">If you believe this is an error or wish to appeal, please contact support@skillswap.ai.</p>
                        </div>
                    `
                });
            } catch (userMailErr) {
                console.error("Could not send suspension notice email:", userMailErr.message);
                throw new ApiError(500, `Failed to send suspension notice email to ${report.reportedUser.email}: ${userMailErr.message}. Report status was NOT updated.`);
            }
        }

        await User.findByIdAndUpdate(report.reportedUser._id || report.reportedUser, {
            accountStatus: "suspended",
            suspendedAt: new Date(),
            suspendedReason: notes || `Suspended due to report #${report._id}`
        });
    }

    // 3. If report status is being updated to "resolved" or "dismissed", EMAIL MUST BE SENT TO REPORTER FIRST!
    if (targetStatus === "resolved" || targetStatus === "dismissed") {
        if (reporterEmail) {
            const isDismissed = targetStatus === "dismissed";
            const subjectHeader = isDismissed ? "Report Review - Dismissed" : "Report Review - Resolved";
            const statusColor = isDismissed ? "#94a3b8" : "#38bdf8";

            try {
                await sendEmail({
                    to: reporterEmail,
                    subject: `[SkillSwap AI Safety Team] Report #${report._id.toString().slice(-6)} ${subjectHeader}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e15; color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                            <h2 style="color: #f97316; margin-top: 0;">SkillSwap AI Moderation Update</h2>
                            <p style="color: #e2e8f0; font-size: 15px;">Hello,</p>
                            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                                Your report ticket regarding <strong>${report.targetType}</strong> (Reason: <em>${report.reason.replace("_", " ")}</em>) has been reviewed and processed by our moderation team.
                            </p>
                            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; margin: 16px 0; border-left: 4px solid ${isDismissed ? '#64748b' : '#f97316'};">
                                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Status:</strong> <span style="color: ${statusColor};">${targetStatus.toUpperCase()}</span></p>
                                <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Action Taken:</strong> ${targetAction}</p>
                                ${notes ? `<p style="margin: 0; font-size: 14px;"><strong>Moderation Notes:</strong> ${notes}</p>` : ""}
                            </div>
                            <p style="color: #94a3b8; font-size: 13px;">Thank you for helping keep SkillSwap AI safe and respectful for everyone.</p>
                            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
                            <p style="color: #64748b; font-size: 12px; margin: 0;">SkillSwap AI Safety & Moderation Team</p>
                        </div>
                    `
                });
            } catch (repMailErr) {
                console.error("Could not send status update email to reporter:", repMailErr.message);
                throw new ApiError(500, `Failed to send email to reporter (${reporterEmail}): ${repMailErr.message}. Report status was NOT marked as ${targetStatus}.`);
            }
        }
    }

    // ONLY when all required emails succeed, update report status in database!
    report.status = targetStatus;
    report.actionTaken = targetAction;
    report.adminNotes = notes;
    report.resolvedAt = new Date();
    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
        report.resolvedBy = req.user._id;
    }

    await report.save();

    // Sync status with linked Contact inquiry if report originated from a support/contact message
    if (report.targetId) {
        try {
            const contactTicket = await Contact.findById(report.targetId);
            if (contactTicket) {
                contactTicket.status = targetStatus;
                if (notes) {
                    contactTicket.replyMessage = notes;
                    contactTicket.repliedAt = new Date();
                }
                await contactTicket.save();
            }
        } catch (syncErr) {
            console.warn("Could not sync Contact ticket status:", syncErr.message);
        }
    }

    return res.status(200).json({
        success: true,
        message: `Report status updated to ${targetStatus} and notification email sent successfully.`,
        data: { report }
    });
});
