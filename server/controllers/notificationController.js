import Notification from "../models/Notification.js";
import Skill from "../models/Skill.js";

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
                name: n.sender.name,
                initials: n.sender.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
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
        const { notificationId } = req.body;

        const filter = { recipient: currentUserId };
        if (notificationId) {
            filter._id = notificationId;
        }

        await Notification.updateMany(filter, { $set: { isRead: true } });

        return res.status(200).json({
            success: true,
            message: "Notifications marked as read successfully"
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
