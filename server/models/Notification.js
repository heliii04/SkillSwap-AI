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

    try {
        const env = doc.constructor.db.base.env || process.env;
        const vapidPublicKey = env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = env.VAPID_PRIVATE_KEY;
        const vapidMailto = env.VAPID_MAILTO || "mailto:support@skillswap.ai";

        if (!vapidPublicKey || !vapidPrivateKey) {
            return;
        }

        const PushMessSubscription = mongoose.model("PushMessSubscription");
        const recipientId = doc.recipient?._id ? doc.recipient._id : doc.recipient;
        const subscriptions = await PushMessSubscription.find({ user: recipientId });
        if (subscriptions.length === 0) return;

        // Configure webpush details dynamically to ensure environment loading has finished
        const webpush = (await import("web-push")).default;
        webpush.setVapidDetails(
            vapidMailto,
            vapidPublicKey,
            vapidPrivateKey
        );

        const pushPayload = JSON.stringify({
            title: doc.title,
            message: doc.message,
            link: doc.link
        });

        const promises = subscriptions.map(async (sub) => {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth
                }
            };
            try {
                await webpush.sendNotification(pushSub, pushPayload);
            } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await PushMessSubscription.deleteOne({ _id: sub._id });
                } else {
                    console.error("Error sending web push to endpoint:", sub.endpoint, err);
                }
            }
        });

        await Promise.all(promises);
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
