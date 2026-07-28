import mongoose from "mongoose";

const authSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            select: false,
        },

        userAgent: {
            type: String,
            default: "",
        },

        ipAddress: {
            type: String,
            default: "",
        },

        expiresAt: {
            type: Date,
            required: true,
            index: {
                expires: 0,
            },
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

authSessionSchema.index({
    user: 1,
    revokedAt: 1,
});

export const AuthSession = mongoose.model(
    "AuthSession",
    authSessionSchema
);