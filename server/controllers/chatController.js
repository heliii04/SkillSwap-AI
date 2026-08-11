import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import SwapRequest from "../models/SwapRequest.js";
import Notification from "../models/Notification.js";

const isSameId = (
    firstId,
    secondId
) => {
    if (!firstId || !secondId) {
        return false;
    }

    return (
        firstId.toString() ===
        secondId.toString()
    );
};

const hasReadMessage = (
    message,
    userId
) => {
    return (
        message.readBy?.some(
            (readerId) =>
                isSameId(
                    readerId,
                    userId
                )
        ) || false
    );
};

const formatUser = (user) => {
    if (!user) {
        return null;
    }

    const name =
        user.name || "User";

    return {
        id: user._id,
        name,
        email: user.email,
        avatar:
            user.avatar || null,
        initials: name
            .split(" ")
            .map(
                (part) =>
                    part[0]
            )
            .join("")
            .toUpperCase()
            .slice(0, 2),
        role:
            user.headline ||
            "Member",
        location:
            user.location ||
            null,
        online: false,
        lastSeen: null,
    };
};

const formatChat = (
    chat,
    currentUserId,
    unreadCount = 0
) => {
    const otherParticipant =
        chat.participants.find(
            (participant) =>
                !isSameId(
                    participant._id,
                    currentUserId
                )
        ) ||
        chat.participants[0];

    const senderSkill =
        chat.swapRequest
            ?.senderSkill;

    const receiverSkill =
        chat.swapRequest
            ?.receiverSkill;

    const isRequestSender =
        isSameId(
            chat.swapRequest
                ?.sender,
            currentUserId
        );

    /*
    User A sends:
    senderSkill   = skill User A teaches
    receiverSkill = skill User B teaches

    For User A:
    teaching = senderSkill
    learning = receiverSkill

    For User B:
    teaching = receiverSkill
    learning = senderSkill
    */

    const teaching =
        isRequestSender
            ? senderSkill?.title
            : receiverSkill?.title;

    const learning =
        isRequestSender
            ? receiverSkill?.title
            : senderSkill?.title;

    return {
        id: chat._id,

        user:
            formatUser(
                otherParticipant
            ),

        skillExchange: {
            teaching:
                teaching ||
                "Skill Exchange",

            learning:
                learning ||
                "Skill Swap",
        },

        unreadCount,

        lastMessage:
            chat.lastMessage
                ? {
                    id: chat
                        .lastMessage
                        ._id,

                    text: chat
                        .lastMessage
                        .text,

                    createdAt:
                        chat
                            .lastMessage
                            .createdAt,

                    sender:
                        isSameId(
                            chat
                                .lastMessage
                                .sender,
                            currentUserId
                        )
                            ? "me"
                            : "other",
                }
                : null,

        swapRequestId:
            chat.swapRequest
                ?._id ||
            chat.swapRequest,

        blockedBy:
            chat.blockedBy || [],

        createdAt:
            chat.createdAt,

        updatedAt:
            chat.updatedAt,
    };
};

const formatMessage = (
    message,
    currentUserId
) => {
    const isMine =
        isSameId(
            message.sender,
            currentUserId
        );

    let status =
        "delivered";

    if (isMine) {
        const readByOtherUser =
            message.readBy?.some(
                (readerId) =>
                    !isSameId(
                        readerId,
                        currentUserId
                    )
            );

        status =
            readByOtherUser
                ? "read"
                : "delivered";
    }

    return {
        id: message._id,

        sender: isMine
            ? "me"
            : "other",

        text: message.text,

        createdAt:
            message.createdAt,

        status,
    };
};

/*
|--------------------------------------------------------------------------
| Get current user's chats
|--------------------------------------------------------------------------
*/

export const getChats =
    async (
        req,
        res,
        next
    ) => {
        try {
            const currentUserId =
                req.user._id;

            const chats =
                await Chat.find({
                    participants:
                        currentUserId,
                    deletedBy: { $ne: currentUserId }
                })
                    .populate({
                        path: "participants",
                        select:
                            "name email avatar headline location",
                    })
                    .populate({
                        path: "swapRequest",
                        populate: [
                            {
                                path: "senderSkill",
                                select: "title",
                            },
                            {
                                path: "receiverSkill",
                                select: "title",
                            },
                        ],
                    })
                    .populate({
                        path: "lastMessage",
                    })
                    .sort({
                        lastMessageAt:
                            -1,
                        updatedAt:
                            -1,
                    });

            const validChats = chats.filter(
                (chat) =>
                    chat.swapRequest &&
                    chat.swapRequest.status === "accepted"
            );

            const chatIds =
                validChats.map(
                    (chat) =>
                        chat._id
                );

            const unreadCounts =
                await Message.aggregate(
                    [
                        {
                            $match: {
                                chat: {
                                    $in: chatIds,
                                },

                                sender: {
                                    $ne: currentUserId,
                                },

                                readBy: {
                                    $ne: currentUserId,
                                },
                            },
                        },

                        {
                            $group: {
                                _id: "$chat",
                                count: {
                                    $sum: 1,
                                },
                            },
                        },
                    ]
                );

            const unreadCountMap =
                new Map(
                    unreadCounts.map(
                        (item) => [
                            item._id.toString(),
                            item.count,
                        ]
                    )
                );

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Chats retrieved successfully",

                    data: {
                        chats:
                            validChats.map(
                                (
                                    chat
                                ) =>
                                    formatChat(
                                        chat,
                                        currentUserId,
                                        unreadCountMap.get(
                                            chat._id.toString()
                                        ) ||
                                        0
                                    )
                            ),
                    },
                });
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get messages and mark received messages as read
|--------------------------------------------------------------------------
*/

export const getMessages =
    async (
        req,
        res,
        next
    ) => {
        try {
            const currentUserId =
                req.user._id;

            const {
                chatId,
            } = req.params;

            const page =
                Math.max(
                    Number(
                        req.query
                            .page
                    ) || 1,
                    1
                );

            const limit =
                Math.min(
                    Math.max(
                        Number(
                            req.query
                                .limit
                        ) ||
                        50,
                        1
                    ),
                    100
                );

            const chat =
                await Chat.findOne(
                    {
                        _id: chatId,
                        participants:
                            currentUserId,
                    }
                );

            if (!chat) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Chat not found or access denied",
                    });
            }

            const userCleared = chat.clearedFor?.find(
                (c) => c.user?.toString() === currentUserId?.toString()
            );

            const messageQuery = { chat: chatId };
            if (userCleared && userCleared.clearedAt) {
                messageQuery.createdAt = { $gt: userCleared.clearedAt };
            }

            await Message.updateMany(
                {
                    ...messageQuery,

                    sender: {
                        $ne: currentUserId,
                    },

                    readBy: {
                        $ne: currentUserId,
                    },
                },
                {
                    $addToSet: {
                        readBy:
                            currentUserId,
                    },
                }
            );

            const skip =
                (page - 1) *
                limit;

            const [
                messages,
                total,
            ] =
                await Promise.all(
                    [
                        Message.find(messageQuery)
                            .sort({
                                createdAt:
                                    -1,
                            })
                            .skip(skip)
                            .limit(
                                limit
                            ),

                        Message.countDocuments(messageQuery),
                    ]
                );

            messages.reverse();

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Messages retrieved successfully",

                    data: {
                        messages:
                            messages.map(
                                (
                                    message
                                ) =>
                                    formatMessage(
                                        message,
                                        currentUserId
                                    )
                            ),

                        pagination: {
                            page,
                            limit,
                            total,
                            totalPages:
                                Math.ceil(
                                    total /
                                    limit
                                ),

                            hasMore:
                                page *
                                limit <
                                total,
                        },
                    },
                });
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Send message
|--------------------------------------------------------------------------
*/

export const sendMessage =
    async (
        req,
        res,
        next
    ) => {
        try {
            const currentUserId =
                req.user._id;

            const {
                chatId,
            } = req.params;

            const text =
                String(
                    req.body
                        .text ||
                    ""
                ).trim();

            if (!text) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Message text is required",
                    });
            }

            if (
                text.length >
                2000
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Message cannot exceed 2000 characters",
                    });
            }

            const chat =
                await Chat.findOne(
                    {
                        _id: chatId,
                        participants:
                            currentUserId,
                    }
                ).populate({
                    path: "swapRequest",
                    select: "status",
                });

            if (!chat) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Chat not found or access denied",
                    });
            }

            if (
                !chat.swapRequest ||
                chat.swapRequest
                    .status !==
                "accepted"
            ) {
                return res
                    .status(403)
                    .json({
                        success: false,
                        message:
                            "Messages can only be sent for an accepted swap request",
                    });
            }

            const message =
                await Message.create(
                    {
                        chat: chatId,

                        sender:
                            currentUserId,

                        text,

                        readBy: [
                            currentUserId,
                        ],
                    }
                );

            await Chat.updateOne(
                {
                    _id: chatId,
                },
                {
                    $set: {
                        lastMessage:
                            message._id,

                        lastMessageAt:
                            message.createdAt,
                        deletedBy: []
                    },
                }
            );

            const otherParticipant =
                chat.participants.find(
                    (
                        participant
                    ) =>
                        !isSameId(
                            participant,
                            currentUserId
                        )
                );

            if (
                otherParticipant
            ) {
                await Notification.create(
                    {
                        recipient:
                            otherParticipant,

                        sender:
                            currentUserId,

                        type: "message",

                        title:
                            "New Message",

                        message: `${req.user
                            .name
                            }: ${message.text.substring(
                                0,
                                50
                            )}${message
                                .text
                                .length >
                                50
                                ? "..."
                                : ""
                            }`,

                        link: `/messages?chatId=${chatId}`,
                    }
                );
            }

            // Real-time broadcast using Socket.io
            const io = req.app.get("io");
            if (io) {
                const socketMsg = {
                    id: message._id.toString(),
                    senderId: message.sender.toString(),
                    text: message.text,
                    createdAt: message.createdAt,
                    status: "delivered"
                };
                io.to(chatId.toString()).emit("new_message", socketMsg);

                // Populate chat to broadcast updated last message details for sidebar
                const chatWithLastMsg = await Chat.findById(chatId)
                    .populate("participants lastMessage")
                    .populate({
                        path: "swapRequest",
                        populate: {
                            path: "senderSkill receiverSkill"
                        }
                    });

                if (chatWithLastMsg) {
                    chatWithLastMsg.participants.forEach((participant) => {
                        const formattedChat = formatChat(chatWithLastMsg, participant._id);
                        io.to(participant._id.toString()).emit("chat_list_update", formattedChat);
                    });
                }
            }

            return res
                .status(201)
                .json({
                    success: true,
                    message:
                        "Message sent successfully",

                    data: {
                        message:
                            formatMessage(
                                message,
                                currentUserId
                            ),
                    },
                });
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Find or create chat for accepted swap request
|--------------------------------------------------------------------------
*/

export const findOrCreateChat =
    async (
        req,
        res,
        next
    ) => {
        try {
            const currentUserId =
                req.user._id;

            const {
                swapRequestId,
            } = req.body;

            if (!swapRequestId) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "swapRequestId is required",
                    });
            }

            const swapRequest =
                await SwapRequest.findOne(
                    {
                        _id: swapRequestId,

                        status:
                            "accepted",

                        $or: [
                            {
                                sender:
                                    currentUserId,
                            },
                            {
                                receiver:
                                    currentUserId,
                            },
                        ],
                    }
                );

            if (!swapRequest) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Accepted swap request was not found or access was denied",
                    });
            }

            let chat =
                await Chat.findOne(
                    {
                        swapRequest:
                            swapRequest._id,
                    }
                );

            if (!chat) {
                try {
                    chat =
                        await Chat.create(
                            {
                                participants:
                                    [
                                        swapRequest.sender,
                                        swapRequest.receiver,
                                    ],

                                swapRequest:
                                    swapRequest._id,
                            }
                        );
                } catch (error) {
                    if (
                        error.code ===
                        11000
                    ) {
                        chat =
                            await Chat.findOne(
                                {
                                    swapRequest:
                                        swapRequest._id,
                                }
                            );
                    } else {
                        throw error;
                    }
                }
            }

            return res
                .status(200)
                .json({
                    success: true,
                    message:
                        "Chat retrieved successfully",

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

export const toggleBlockChat = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: currentUserId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied"
            });
        }

        const isBlocked = chat.blockedBy.includes(currentUserId);
        if (isBlocked) {
            chat.blockedBy = chat.blockedBy.filter(id => id.toString() !== currentUserId.toString());
        } else {
            chat.blockedBy.push(currentUserId);
        }

        await chat.save();

        const io = req.app.get("io");
        if (io) {
            io.to(chatId.toString()).emit("chat_block_update", {
                chatId,
                blockedBy: chat.blockedBy
            });
        }

        return res.status(200).json({
            success: true,
            message: isBlocked ? "User unblocked successfully" : "User blocked successfully",
            data: {
                blockedBy: chat.blockedBy
            }
        });
    } catch (error) {
        return next(error);
    }
};

export const clearChatMessages = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: currentUserId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied"
            });
        }

        if (!chat.clearedFor) chat.clearedFor = [];
        const existingIndex = chat.clearedFor.findIndex(
            (c) => c.user?.toString() === currentUserId?.toString()
        );

        if (existingIndex > -1) {
            chat.clearedFor[existingIndex].clearedAt = new Date();
        } else {
            chat.clearedFor.push({ user: currentUserId, clearedAt: new Date() });
        }

        await chat.save();

        const io = req.app.get("io");
        if (io) {
            io.to(chatId.toString()).emit("chat_cleared", { chatId, userId: currentUserId });
        }

        return res.status(200).json({
            success: true,
            message: "Chat cleared successfully"
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteChatRoom = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const { chatId } = req.params;
        const { deleteType } = req.body;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: currentUserId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied"
            });
        }

        if (deleteType === "everyone") {
            await Message.deleteMany({ chat: chatId });
            await Chat.deleteOne({ _id: chatId });

            const io = req.app.get("io");
            if (io) {
                io.to(chatId.toString()).emit("chat_deleted", { chatId, deleteType: "everyone" });
            }

            return res.status(200).json({
                success: true,
                message: "Chat deleted for everyone successfully"
            });
        } else {
            if (!chat.deletedBy) chat.deletedBy = [];
            if (!chat.deletedBy.some(id => id.toString() === currentUserId.toString())) {
                chat.deletedBy.push(currentUserId);
            }

            if (!chat.clearedFor) chat.clearedFor = [];
            const existingIndex = chat.clearedFor.findIndex(
                (c) => c.user?.toString() === currentUserId?.toString()
            );

            if (existingIndex > -1) {
                chat.clearedFor[existingIndex].clearedAt = new Date();
            } else {
                chat.clearedFor.push({ user: currentUserId, clearedAt: new Date() });
            }

            if (chat.deletedBy.length === 2) {
                await Message.deleteMany({ chat: chatId });
                await Chat.deleteOne({ _id: chatId });
            } else {
                await chat.save();
            }

            // Notify over sockets to clear sidebar for deleting user only
            const io = req.app.get("io");
            if (io) {
                io.to(chatId.toString()).emit("chat_deleted", { chatId, deleteType: "me", userId: currentUserId });
            }

            return res.status(200).json({
                success: true,
                message: "Chat deleted successfully"
            });
        }
    } catch (error) {
        return next(error);
    }
};