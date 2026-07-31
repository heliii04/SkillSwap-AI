import mongoose from "mongoose";
import { encryptMessage, decryptMessage } from "../utils/encryption.js";

const messageSchema =
    new mongoose.Schema(
        {
            chat: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chat",
                required: [
                    true,
                    "Chat is required",
                ],
                index: true,
            },

            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: [
                    true,
                    "Sender is required",
                ],
                index: true,
            },

            text: {
                type: String,
                required: [
                    true,
                    "Message text is required",
                ],
                trim: true,
                minlength: [
                    1,
                    "Message cannot be empty",
                ],
                get: decryptMessage,
                set: encryptMessage,
            },

            readBy: {
                type: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                ],
                default: [],
            },

            deliveredAt: {
                type: Date,
                default: Date.now,
            },
        },
        {
            timestamps: true,
            versionKey: false,
            toJSON: { getters: true },
            toObject: { getters: true },
        }
    );

messageSchema.index({
    chat: 1,
    createdAt: -1,
});

messageSchema.index({
    chat: 1,
    sender: 1,
    createdAt: -1,
});

const Message =
    mongoose.models.Message ||
    mongoose.model(
        "Message",
        messageSchema
    );

export default Message;