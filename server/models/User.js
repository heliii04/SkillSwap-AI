import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        avatar: {
            publicId: {
                type: String,
                default: null,
            },

            url: {
                type: String,
                default: null,
            },
        },

        headline: {
            type: String,
            trim: true,
            maxlength: 120,
            default: "",
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },

        location: {
            city: {
                type: String,
                trim: true,
                maxlength: 80,
                default: "",
            },

            state: {
                type: String,
                trim: true,
                maxlength: 80,
                default: "",
            },

            country: {
                type: String,
                trim: true,
                maxlength: 80,
                default: "",
            },
        },

        socialLinks: {
            github: {
                type: String,
                trim: true,
                maxlength: 300,
                default: "",
            },

            linkedin: {
                type: String,
                trim: true,
                maxlength: 300,
                default: "",
            },

            portfolio: {
                type: String,
                trim: true,
                maxlength: 300,
                default: "",
            },
        },

        profileCompletion: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        accountStatus: {
            type: String,
            enum: [
                "active",
                "suspended",
                "deactivated",
            ],
            default: "active",
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        emailVerificationOtpHash: {
            type: String,
            select: false,
            default: null,
        },

        emailVerificationOtpExpiresAt: {
            type: Date,
            select: false,
            default: null,
        },

        emailVerificationOtpAttempts: {
            type: Number,
            select: false,
            default: 0,
        },

        emailVerificationOtpLastSentAt: {
            type: Date,
            select: false,
            default: null,
        },

        passwordChangedAt: {
            type: Date,
            default: null,
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,

        toJSON: {
            transform(_document, returnedObject) {
                delete returnedObject.passwordHash;
                delete returnedObject.emailVerificationOtpHash;
                delete returnedObject.emailVerificationOtpExpiresAt;
                delete returnedObject.emailVerificationOtpAttempts;
                delete returnedObject.emailVerificationOtpLastSentAt;

                return returnedObject;
            },
        },
    }
);

export const User = mongoose.model(
    "User",
    userSchema
);

export default User;