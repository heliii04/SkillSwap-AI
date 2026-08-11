import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },
        targetType: {
            type: String,
            enum: ["user", "skill", "message", "chat"],
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        reportedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        reason: {
            type: String,
            required: true,
            enum: [
                "spam",
                "harassment",
                "inappropriate_content",
                "fake_profile",
                "scam",
                "other",
            ],
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved", "dismissed"],
            default: "pending",
            index: true,
        },
        adminNotes: {
            type: String,
            default: "",
        },
        actionTaken: {
            type: String,
            enum: ["none", "warning_sent", "user_suspended", "content_removed"],
            default: "none",
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        resolvedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

reportSchema.index({ status: 1, createdAt: -1 });

const Report =
    mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
