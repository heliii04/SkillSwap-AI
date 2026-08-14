import mongoose from "mongoose";
import "./PushMessSubscription.js";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        type: {
            type: String,
            enum: ["swap_request", "swap_accepted", "swap_rejected", "message", "ai_suggestion"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            default: null,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Register Web Push notification post-save hook
notificationSchema.post("save", async function (doc) {
    try {
        const recipientId = doc.recipient?._id ? doc.recipient._id.toString() : doc.recipient?.toString();
        if (global.io && recipientId) {
            global.io.to(recipientId).emit("new_notification", {
                id: doc._id,
                type: doc.type,
                title: doc.title,
                message: doc.message,
                link: doc.link,
                isRead: doc.isRead,
                createdAt: doc.createdAt
            });
        }
    } catch (err) {
        console.error("Error emitting real-time socket notification:", err);
    }

    // Enqueue Web Push notification dispatch to background task queue manager
    try {
        import("../services/queueManager.js").then(({ queueManager, JOB_TYPES }) => {
            queueManager.enqueue(JOB_TYPES.SEND_WEB_PUSH_NOTIFICATION, { notificationId: doc._id });
        }).catch((err) => {
            console.error("Error enqueuing Web Push notification job:", err);
        });
    } catch (err) {
        console.error("Error in Notification Schema post-save hook:", err);
    }
});

notificationSchema.index({
    recipient: 1,
    isRead: 1,
    createdAt: -1,
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;
