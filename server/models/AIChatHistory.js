import mongoose from "mongoose";

const aiChatMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: String,
            enum: ["user", "ai"],
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const aiChatSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        title: {
            type: String,
            default: "New Conversation",
        },
        messages: [aiChatMessageSchema],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

aiChatSessionSchema.index({ user: 1, sessionId: 1 }, { unique: true });

const AIChatHistory =
    mongoose.models.AIChatHistory ||
    mongoose.model("AIChatHistory", aiChatSessionSchema);

export default AIChatHistory;
