import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        participants: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
            ],
            validate: {
                validator(participants) {
                    if (!Array.isArray(participants)) {
                        return false;
                    }

                    const uniqueParticipants =
                        new Set(
                            participants.map(
                                (participant) =>
                                    participant.toString()
                            )
                        );

                    return (
                        participants.length === 2 &&
                        uniqueParticipants.size === 2
                    );
                },
                message:
                    "A chat must contain exactly two different participants",
            },
            required: true,
        },

        swapRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapRequest",
            required: [
                true,
                "Swap request is required",
            ],
            unique: true,
            index: true,
        },

        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },

        lastMessageAt: {
            type: Date,
            default: null,
            index: true,
        },
        blockedBy: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            default: [],
        },
        deletedBy: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            default: [],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

chatSchema.index({
    participants: 1,
    lastMessageAt: -1,
});

const Chat =
    mongoose.models.Chat ||
    mongoose.model(
        "Chat",
        chatSchema
    );

export default Chat;