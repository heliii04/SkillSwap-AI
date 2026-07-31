import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "account",
                "technical",
                "feature",
                "safety",
            ],
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "resolved"],
            default: "pending",
        },
        replyMessage: {
            type: String,
            default: "",
        },
        repliedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Contact = mongoose.model("Contact", contactSchema);

export default Contact;
