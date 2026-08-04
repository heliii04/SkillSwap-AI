import Notification from "../models/Notification.js";
import Skill from "../models/Skill.js";
import PushMessSubscription from "../models/PushMessSubscription.js";
import webpush from "web-push";
import { env } from "../config/env.js";

if (env.vapidPublicKey && env.vapidPrivateKey) {
    webpush.setVapidDetails(
        env.vapidMailto,
        env.vapidPublicKey,
        env.vapidPrivateKey
    );
}

const generateAiSuggestions = async (userId) => {
    try {
        const userLearnSkills = await Skill.find({ owner: userId, type: "learn" });
        if (userLearnSkills.length === 0) return;

        for (const learnSkill of userLearnSkills) {
            const matchingTeachSkill = await Skill.findOne({
                type: "teach",
                title: { $regex: new RegExp(`^${learnSkill.title}$`, "i") },
                owner: { $ne: userId }
            }).populate("owner");

            if (matchingTeachSkill && matchingTeachSkill.owner) {
                const partnerName = matchingTeachSkill.owner.name;
                const existingNotification = await Notification.findOne({
                    recipient: userId,
                    type: "ai_suggestion",
                    message: new RegExp(partnerName, "i")
                });

                if (!existingNotification) {
                    await Notification.create({
                        recipient: userId,
                        type: "ai_suggestion",
                        title: "AI Match Suggestion",
                        message: `We found a match! ${partnerName} offers to teach "${matchingTeachSkill.title}" which is on your wishlist.`,
                        link: `/search?query=${encodeURIComponent(matchingTeachSkill.title)}`
                    });
                }
            }
        }
    } catch (err) {
        console.error("Error generating AI suggestions:", err);
    }
};

export const getNotifications = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;

        await generateAiSuggestions(currentUserId);

        const notifications = await Notification.find({ recipient: currentUserId })
            .populate({
                path: "sender",
                select: "name avatar"
            })
            .sort({ createdAt: -1 });

        const formatted = notifications.map(n => ({
            id: n._id,
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link,
            isRead: n.isRead,
            createdAt: n.createdAt,
            sender: n.sender ? {
                id: n.sender._id,
                name: n.sender.name || "Unknown",
                initials: (n.sender.name || "U").split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2)
            } : null
        }));

        return res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: {
                notifications: formatted
            }
        });
    } catch (error) {
        return next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { notificationId } = req.body || {};

        if (notificationId) {
            await Notification.updateOne(
                { _id: notificationId, recipient: currentUserId },
                { $set: { isRead: true } }
            );
        } else {
            // Delete all notifications for the user to completely clear the page
            await Notification.deleteMany({ recipient: currentUserId });
        }

        return res.status(200).json({
            success: true,
            message: notificationId
                ? "Notification marked as read successfully"
                : "All notifications cleared successfully"
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { id } = req.params;

        const deleted = await Notification.findOneAndDelete({
            _id: id,
            recipient: currentUserId
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or access denied"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });
    } catch (error) {
        return next(error);
    }
};

export const subscribePush = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const subscriptionData = req.body;

        if (!subscriptionData || !subscriptionData.endpoint) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription payload"
            });
        }

        await PushMessSubscription.findOneAndUpdate(
            { endpoint: subscriptionData.endpoint },
            {
                user: currentUserId,
                endpoint: subscriptionData.endpoint,
                keys: subscriptionData.keys
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Push subscription registered successfully"
        });
    } catch (error) {
        return next(error);
    }
};

export const sendWebPush = async (recipientId, payload) => {
    try {
        if (!env.vapidPublicKey || !env.vapidPrivateKey) {
            console.warn("VAPID keys not configured. Skipping push notification.");
            return;
        }

        const subscriptions = await PushMessSubscription.find({ user: recipientId });
        if (subscriptions.length === 0) return;

        const pushPayload = JSON.stringify(payload);

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
        console.error("Error in sendWebPush:", err);
    }
};
