import SwapRequest from "../models/SwapRequest.js";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Notification from "../models/Notification.js";

/*
|--------------------------------------------------------------------------
| Populate swap request
|--------------------------------------------------------------------------
*/

const populateSwapRequest = (query) => {
    return query
        .populate({
            path: "sender",
            select: "name email avatar headline location rating reviews",
        })
        .populate({
            path: "receiver",
            select: "name email avatar headline location rating reviews",
        })
        .populate({
            path: "senderSkill",
            select:
                "title category level teachingMode availability tags isActive",
        })
        .populate({
            path: "receiverSkill",
            select:
                "title category level teachingMode availability tags isActive",
        })
        .lean();
};

/*
|--------------------------------------------------------------------------
| Format helpers
|--------------------------------------------------------------------------
*/

const formatUser = (user) => {
    if (!user) {
        return null;
    }

    return {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        headline: user.headline || null,
        location: user.location || null,
        rating: user.rating || 0,
        reviews: user.reviews || 0,
    };
};

const formatSkill = (skill) => {
    if (!skill) {
        return null;
    }

    return {
        id: skill._id,
        title: skill.title,
        category: skill.category,
        level: skill.level,
        teachingMode: skill.teachingMode,
        availability: skill.availability,
        tags: skill.tags || [],
        isActive: skill.isActive,
    };
};

const formatSwapRequest = (request) => ({
    id: request._id,

    sender: formatUser(
        request.sender
    ),

    receiver: formatUser(
        request.receiver
    ),

    senderSkill: formatSkill(
        request.senderSkill
    ),

    receiverSkill: formatSkill(
        request.receiverSkill
    ),

    message: request.message,
    status: request.status,
    expiresAt: request.expiresAt,
    respondedAt: request.respondedAt,
    cancelledAt: request.cancelledAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
});

/*
|--------------------------------------------------------------------------
| Expire old pending requests
|--------------------------------------------------------------------------
*/

const expireOldPendingRequests =
    async (filter = {}) => {
        await SwapRequest.updateMany(
            {
                ...filter,
                status: "pending",
                expiresAt: {
                    $lte: new Date(),
                },
            },
            {
                $set: {
                    status: "expired",
                    respondedAt:
                        new Date(),
                },
            }
        );
    };

/*
|--------------------------------------------------------------------------
| Create swap request
|--------------------------------------------------------------------------
*/

export const createSwapRequest =
    async (
        req,
        res,
        next
    ) => {
        try {
            const {
                receiverId,
                senderSkillId,
                receiverSkillId,
                message,
            } = req.body;

            const senderId =
                req.user._id;

            if (
                senderId.toString() ===
                receiverId
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "You cannot send a swap request to yourself",
                    });
            }

            const receiverExists =
                await User.exists({
                    _id: receiverId,
                });

            if (!receiverExists) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Receiver was not found",
                    });
            }

            const [
                senderSkill,
                receiverSkill,
            ] = await Promise.all([
                Skill.findOne({
                    _id: senderSkillId,
                    owner: senderId,
                    type: "teach",
                    isActive: true,
                }),

                Skill.findOne({
                    _id: receiverSkillId,
                    owner: receiverId,
                    type: "teach",
                    isActive: true,
                }),
            ]);

            if (!senderSkill) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Your selected teaching skill was not found or is inactive",
                    });
            }

            if (!receiverSkill) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Receiver teaching skill was not found or is inactive",
                    });
            }

            await expireOldPendingRequests(
                {
                    sender:
                        senderId,
                    receiver:
                        receiverId,
                }
            );

            const existingRequest =
                await SwapRequest.findOne(
                    {
                        sender:
                            senderId,

                        receiver:
                            receiverId,

                        senderSkill:
                            senderSkillId,

                        receiverSkill:
                            receiverSkillId,

                        status:
                            "pending",
                    }
                );

            if (existingRequest) {
                return res
                    .status(409)
                    .json({
                        success: false,
                        message:
                            "A pending request for this skill exchange already exists",
                    });
            }

            const swapRequest =
                await SwapRequest.create(
                    {
                        sender:
                            senderId,

                        receiver:
                            receiverId,

                        senderSkill:
                            senderSkillId,

                        receiverSkill:
                            receiverSkillId,

                        message:
                            message || "",
                    }
                );

            const populatedRequest =
                await populateSwapRequest(
                    SwapRequest.findById(
                        swapRequest._id
                    )
                );

            await Notification.create(
                {
                    recipient:
                        receiverId,

                    sender:
                        senderId,

                    type:
                        "swap_request",

                    title:
                        "New Swap Request",

                    message: `${req.user.name} wants to swap skills with you!`,

                    link:
                        "/requests",
                }
            );

            return res
                .status(201)
                .json({
                    success: true,

                    message:
                        "Swap request sent successfully",

                    data: {
                        request:
                            formatSwapRequest(
                                populatedRequest
                            ),
                    },
                });
        } catch (error) {
            if (
                error.code ===
                11000
            ) {
                return res
                    .status(409)
                    .json({
                        success: false,

                        message:
                            "A pending request for this skill exchange already exists",
                    });
            }

            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get sent requests
|--------------------------------------------------------------------------
*/

export const getSentSwapRequests =
    async (
        req,
        res,
        next
    ) => {
        try {
            await expireOldPendingRequests(
                {
                    sender:
                        req.user._id,
                }
            );

            const query =
                req.validatedQuery ||
                req.query;

            const page =
                Number(
                    query.page
                ) || 1;

            const limit =
                Number(
                    query.limit
                ) || 10;

            const skip =
                (page - 1) *
                limit;

            const filter = {
                sender:
                    req.user._id,
            };

            if (query.status) {
                filter.status =
                    query.status;
            }

            const [
                requests,
                total,
            ] = await Promise.all([
                populateSwapRequest(
                    SwapRequest.find(
                        filter
                    )
                )
                    .sort({
                        createdAt:
                            -1,
                    })
                    .skip(skip)
                    .limit(limit),

                SwapRequest.countDocuments(
                    filter
                ),
            ]);

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Sent swap requests retrieved successfully",

                    data: {
                        requests:
                            requests.map(
                                formatSwapRequest
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
                        },
                    },
                });
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get received requests
|--------------------------------------------------------------------------
*/

export const getReceivedSwapRequests =
    async (
        req,
        res,
        next
    ) => {
        try {
            await expireOldPendingRequests(
                {
                    receiver:
                        req.user._id,
                }
            );

            const query =
                req.validatedQuery ||
                req.query;

            const page =
                Number(
                    query.page
                ) || 1;

            const limit =
                Number(
                    query.limit
                ) || 10;

            const skip =
                (page - 1) *
                limit;

            const filter = {
                receiver:
                    req.user._id,
            };

            if (query.status) {
                filter.status =
                    query.status;
            }

            const [
                requests,
                total,
            ] = await Promise.all([
                populateSwapRequest(
                    SwapRequest.find(
                        filter
                    )
                )
                    .sort({
                        createdAt:
                            -1,
                    })
                    .skip(skip)
                    .limit(limit),

                SwapRequest.countDocuments(
                    filter
                ),
            ]);

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Received swap requests retrieved successfully",

                    data: {
                        requests:
                            requests.map(
                                formatSwapRequest
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
                        },
                    },
                });
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Get one request
|--------------------------------------------------------------------------
*/

export const getSwapRequestById =
    async (
        req,
        res,
        next
    ) => {
        try {
            await expireOldPendingRequests(
                {
                    _id:
                        req.params
                            .requestId,
                }
            );

            const request =
                await populateSwapRequest(
                    SwapRequest.findOne(
                        {
                            _id:
                                req.params
                                    .requestId,

                            $or: [
                                {
                                    sender:
                                        req
                                            .user
                                            ._id,
                                },
                                {
                                    receiver:
                                        req
                                            .user
                                            ._id,
                                },
                            ],
                        }
                    )
                );

            if (!request) {
                return res
                    .status(404)
                    .json({
                        success: false,

                        message:
                            "Swap request was not found",
                    });
            }

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Swap request retrieved successfully",

                    data: {
                        request:
                            formatSwapRequest(
                                request
                            ),
                    },
                });
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Accept request
|--------------------------------------------------------------------------
*/

export const acceptSwapRequest =
    async (
        req,
        res,
        next
    ) => {
        try {
            await expireOldPendingRequests(
                {
                    _id:
                        req.params
                            .requestId,
                }
            );

            const request =
                await SwapRequest.findOneAndUpdate(
                    {
                        _id:
                            req.params
                                .requestId,

                        receiver:
                            req.user
                                ._id,

                        status:
                            "pending",

                        expiresAt: {
                            $gt:
                                new Date(),
                        },
                    },
                    {
                        $set: {
                            status:
                                "accepted",

                            respondedAt:
                                new Date(),
                        },
                    },
                    {
                        new: true,
                        runValidators:
                            true,
                    }
                );

            if (!request) {
                return res
                    .status(409)
                    .json({
                        success: false,

                        message:
                            "Request was not found, has expired, or is no longer pending",
                    });
            }

            /*
            |--------------------------------------------------------------------------
            | Find or create chat using exact swap request
            |--------------------------------------------------------------------------
            */

            let chat =
                await Chat.findOne(
                    {
                        swapRequest:
                            request._id,
                    }
                );

            if (!chat) {
                try {
                    chat =
                        await Chat.create(
                            {
                                participants:
                                    [
                                        request.sender,
                                        request.receiver,
                                    ],

                                swapRequest:
                                    request._id,
                            }
                        );
                } catch (error) {
                    /*
                    Duplicate key can happen when two requests hit almost together.
                    In that case, fetch the chat that was already created.
                    */

                    if (
                        error.code ===
                        11000
                    ) {
                        chat =
                            await Chat.findOne(
                                {
                                    swapRequest:
                                        request._id,
                                }
                            );
                    } else {
                        throw error;
                    }
                }
            }

            if (!chat) {
                const rollbackResult =
                    await SwapRequest.updateOne(
                        {
                            _id:
                                request._id,

                            status:
                                "accepted",
                        },
                        {
                            $set: {
                                status:
                                    "pending",
                            },

                            $unset: {
                                respondedAt:
                                    1,
                            },
                        }
                    );

                return res
                    .status(500)
                    .json({
                        success: false,

                        message:
                            rollbackResult.modifiedCount >
                                0
                                ? "Chat could not be created. The request was restored to pending."
                                : "Chat could not be created after accepting the request.",
                    });
            }

            const populatedRequest =
                await populateSwapRequest(
                    SwapRequest.findById(
                        request._id
                    )
                );

            await Notification.create(
                {
                    recipient:
                        request.sender,

                    sender:
                        req.user._id,

                    type:
                        "swap_accepted",

                    title:
                        "Swap Request Accepted",

                    message: `${req.user.name} accepted your skill exchange request!`,

                    link: `/messages?chatId=${chat._id}`,
                }
            );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Swap request accepted successfully",

                    data: {
                        request:
                            formatSwapRequest(
                                populatedRequest
                            ),

                        chat: {
                            id:
                                chat._id,
                        },
                    },
                });
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Reject request
|--------------------------------------------------------------------------
*/

export const rejectSwapRequest =
    async (
        req,
        res,
        next
    ) => {
        try {
            await expireOldPendingRequests(
                {
                    _id:
                        req.params
                            .requestId,
                }
            );

            const request =
                await SwapRequest.findOneAndUpdate(
                    {
                        _id:
                            req.params
                                .requestId,

                        receiver:
                            req.user
                                ._id,

                        status:
                            "pending",

                        expiresAt: {
                            $gt:
                                new Date(),
                        },
                    },
                    {
                        $set: {
                            status:
                                "rejected",

                            respondedAt:
                                new Date(),
                        },
                    },
                    {
                        new: true,

                        runValidators:
                            true,
                    }
                );

            if (!request) {
                return res
                    .status(409)
                    .json({
                        success: false,

                        message:
                            "Request was not found, has expired, or is no longer pending",
                    });
            }

            const populatedRequest =
                await populateSwapRequest(
                    SwapRequest.findById(
                        request._id
                    )
                );

            await Notification.create(
                {
                    recipient:
                        request.sender,

                    sender:
                        req.user._id,

                    type:
                        "swap_rejected",

                    title:
                        "Swap Request Declined",

                    message: `${req.user.name} declined your skill exchange request.`,

                    link:
                        "/requests",
                }
            );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Swap request rejected successfully",

                    data: {
                        request:
                            formatSwapRequest(
                                populatedRequest
                            ),
                    },
                });
        } catch (error) {
            return next(error);
        }
    };

/*
|--------------------------------------------------------------------------
| Cancel request
|--------------------------------------------------------------------------
*/

export const cancelSwapRequest =
    async (
        req,
        res,
        next
    ) => {
        try {
            await expireOldPendingRequests(
                {
                    _id:
                        req.params
                            .requestId,
                }
            );

            const request =
                await SwapRequest.findOneAndUpdate(
                    {
                        _id:
                            req.params
                                .requestId,

                        sender:
                            req.user
                                ._id,

                        status:
                            "pending",

                        expiresAt: {
                            $gt:
                                new Date(),
                        },
                    },
                    {
                        $set: {
                            status:
                                "cancelled",

                            cancelledAt:
                                new Date(),
                        },
                    },
                    {
                        new: true,

                        runValidators:
                            true,
                    }
                );

            if (!request) {
                return res
                    .status(409)
                    .json({
                        success: false,

                        message:
                            "Request was not found, has expired, or is no longer pending",
                    });
            }

            const populatedRequest =
                await populateSwapRequest(
                    SwapRequest.findById(
                        request._id
                    )
                );

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        "Swap request cancelled successfully",

                    data: {
                        request:
                            formatSwapRequest(
                                populatedRequest
                            ),
                    },
                });
        } catch (error) {
            return next(error);
        }
    };