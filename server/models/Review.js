import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: "",
            trim: true,
            maxLength: 1000,
        },
        swapRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SwapRequest",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

reviewSchema.index({ targetUser: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, targetUser: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
