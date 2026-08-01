import mongoose from "mongoose";

const roadmapWeekSchema = new mongoose.Schema(
    {
        week: {
            type: Number,
            required: true,
        },

        focus: {
            type: String,
            trim: true,
            default: "",
        },

        goal: {
            type: String,
            trim: true,
            default: "",
        },

        activities: {
            type: [String],
            default: [],
        },

        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: false,
    }
);

const roadmapSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: "",
        },

        summary: {
            type: String,
            trim: true,
            default: "",
        },

        weeks: {
            type: [roadmapWeekSchema],
            default: [],
        },

        // "ai" when the plan came from the model, "template" on fallback.
        source: {
            type: String,
            enum: ["ai", "template"],
            default: "template",
        },

        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        generatedAt: {
            type: Date,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const swapRequestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender is required"],
            index: true,
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Receiver is required"],
            index: true,
        },

        senderSkill: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Skill",
            required: [true, "Sender skill is required"],
        },

        receiverSkill: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Skill",
            required: [true, "Receiver skill is required"],
        },

        message: {
            type: String,
            trim: true,
            maxlength: [
                500,
                "Message cannot exceed 500 characters",
            ],
            default: "",
        },

        status: {
            type: String,
            enum: {
                values: [
                    "pending",
                    "accepted",
                    "rejected",
                    "cancelled",
                    "expired",
                ],
                message: "Invalid swap request status",
            },
            default: "pending",
            index: true,
        },

        expiresAt: {
            type: Date,
            required: [
                true,
                "Expiration date is required",
            ],
            default: () =>
                new Date(
                    Date.now() +
                        7 *
                            24 *
                            60 *
                            60 *
                            1000
                ),
            index: true,
        },

        respondedAt: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        roadmap: {
            type: roadmapSchema,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Mongoose-compatible synchronous validation middleware
swapRequestSchema.pre(
    "validate",
    function validateParticipants() {
        if (
            this.sender &&
            this.receiver &&
            this.sender.toString() ===
                this.receiver.toString()
        ) {
            this.invalidate(
                "receiver",
                "Sender and receiver cannot be the same user"
            );
        }

        if (
            this.senderSkill &&
            this.receiverSkill &&
            this.senderSkill.toString() ===
                this.receiverSkill.toString()
        ) {
            this.invalidate(
                "receiverSkill",
                "Sender skill and receiver skill cannot be the same"
            );
        }
    }
);

// Fast inbox queries
swapRequestSchema.index({
    receiver: 1,
    status: 1,
    createdAt: -1,
});

// Fast sent-request queries
swapRequestSchema.index({
    sender: 1,
    status: 1,
    createdAt: -1,
});

// Prevent the exact same active request from being created twice
swapRequestSchema.index(
    {
        sender: 1,
        receiver: 1,
        senderSkill: 1,
        receiverSkill: 1,
        status: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            status: "pending",
        },
        name: "unique_pending_swap_request",
    }
);

const SwapRequest =
    mongoose.models.SwapRequest ||
    mongoose.model(
        "SwapRequest",
        swapRequestSchema
    );

export default SwapRequest;