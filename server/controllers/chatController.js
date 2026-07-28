import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import SwapRequest from "../models/SwapRequest.js";
import Notification from "../models/Notification.js";

const formatChat = (chat, currentUserId) => {
    const otherParticipant = chat.participants.find(
        (p) => p._id.toString() !== currentUserId.toString()
    ) || chat.participants[0];

    const senderSkill = chat.swapRequest?.senderSkill;
    const receiverSkill = chat.swapRequest?.receiverSkill;

    let teaching = "";
    let learning = "";

    if (chat.swapRequest) {
        const isRequestSender = chat.swapRequest.sender.toString() === currentUserId.toString();
        teaching = isRequestSender ? receiverSkill?.title : senderSkill?.title;
        learning = isRequestSender ? senderSkill?.title : receiverSkill?.title;
    }

    return {
        id: chat._id,
        user: {
            id: otherParticipant?._id,
            name: otherParticipant?.name,
            initials: otherParticipant?.name
                ? otherParticipant.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : "U",
            role: otherParticipant?.headline || "Member",
            online: false,
            lastSeen: null,
        },
        skillExchange: {
            teaching: teaching || "Skill Exchange",
            learning: learning || "Skill Swap",
        },
        unreadCount: 0,
        lastMessage: chat.lastMessage
            ? {
                  id: chat.lastMessage._id,
                  text: chat.lastMessage.text,
                  createdAt: chat.lastMessage.createdAt,
                  sender: chat.lastMessage.sender.toString() === currentUserId.toString() ? "me" : "other",
              }
            : null,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
    };
};

export const getChats = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;

        const chats = await Chat.find({
            participants: currentUserId,
        })
            .populate({
                path: "participants",
                select: "name email avatar headline location",
            })
            .populate({
                path: "swapRequest",
                populate: [
                    { path: "senderSkill", select: "title" },
                    { path: "receiverSkill", select: "title" },
                ],
            })
            .populate({
                path: "lastMessage",
            })
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            data: {
                chats: chats.map((chat) => formatChat(chat, currentUserId)),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: currentUserId,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied",
            });
        }

        const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Messages retrieved successfully",
            data: {
                messages: messages.map((m) => ({
                    id: m._id,
                    sender: m.sender.toString() === currentUserId.toString() ? "me" : "other",
                    text: m.text,
                    createdAt: m.createdAt,
                    status: m.readBy.includes(currentUserId) ? "read" : "delivered",
                })),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { chatId } = req.params;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message text is required",
            });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            participants: currentUserId,
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied",
            });
        }

        const message = await Message.create({
            chat: chatId,
            sender: currentUserId,
            text: text.trim(),
            readBy: [currentUserId],
        });

        chat.lastMessage = message._id;
        await chat.save();

        const otherParticipant = chat.participants.find(
            (p) => p.toString() !== currentUserId.toString()
        );
        if (otherParticipant) {
            await Notification.create({
                recipient: otherParticipant,
                sender: currentUserId,
                type: "message",
                title: "New Message",
                message: `${req.user.name}: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`,
                link: `/messages?chatId=${chatId}`
            });
        }

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: {
                message: {
                    id: message._id,
                    sender: "me",
                    text: message.text,
                    createdAt: message.createdAt,
                    status: "delivered",
                },
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const findOrCreateChat = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { swapRequestId } = req.body;

        if (!swapRequestId) {
            return res.status(400).json({
                success: false,
                message: "swapRequestId is required",
            });
        }

        const swapRequest = await SwapRequest.findById(swapRequestId);
        if (!swapRequest) {
            return res.status(404).json({
                success: false,
                message: "Swap request not found",
            });
        }

        let chat = await Chat.findOne({
            participants: { $all: [swapRequest.sender, swapRequest.receiver] },
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [swapRequest.sender, swapRequest.receiver],
                swapRequest: swapRequest._id,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Chat retrieved or created successfully",
            data: {
                chat: {
                    id: chat._id,
                },
            },
        });
    } catch (error) {
        return next(error);
    }
};
