import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [80, "Name cannot exceed 80 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            maxlength: 254,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
            index: true,
        },

        emailVerificationOtpHash: {
            type: String,
            select: false,
        },

        emailVerificationOtpExpiresAt: {
            type: Date,
            select: false,
        },

        emailVerificationOtpAttempts: {
            type: Number,
            default: 0,
            select: false,
        },

        emailVerificationOtpLastSentAt: {
            type: Date,
            select: false,
        },

        emailVerifiedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// userSchema.index(
//     { emailVerificationOtpExpiresAt: 1 },
//     {
//         expireAfterSeconds: 0,
//         partialFilterExpression: {
//             emailVerificationOtpExpiresAt: {
//                 $type: "date",
//             },
//         },
//     }
// );

export default mongoose.model("User", userSchema);