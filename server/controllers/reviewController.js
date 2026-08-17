import mongoose from "mongoose";
import Review from "../models/Review.js";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Recalculate average rating and total review count for a target user
 */
export const recalculateUserRating = async (targetUserId) => {
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) return { rating: 0, reviews: 0 };

    const stats = await Review.aggregate([
        { $match: { targetUser: new mongoose.Types.ObjectId(targetUserId) } },
        {
            $group: {
                _id: "$targetUser",
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    let rating = 0;
    let reviews = 0;

    if (stats.length > 0) {
        rating = Math.round(stats[0].avgRating * 10) / 10;
        reviews = stats[0].totalReviews;
    }

    await User.findByIdAndUpdate(targetUserId, {
        $set: { rating, reviews },
    });

    return { rating, reviews };
};

/**
 * Add or update review for a mentor/partner
 */
export const addReview = asyncHandler(async (req, res) => {
    const reviewerId = req.user._id;
    const { targetUserId, rating, comment, swapRequestId } = req.body || {};

    if (!targetUserId || !rating) {
        throw new ApiError(400, "Target user and star rating are required.");
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5 stars.");
    }

    if (reviewerId.toString() === targetUserId.toString()) {
        throw new ApiError(400, "You cannot review your own profile.");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new ApiError(404, "Target user was not found.");
    }

    const review = await Review.findOneAndUpdate(
        { reviewer: reviewerId, targetUser: targetUserId },
        {
            $set: {
                rating: numericRating,
                comment: (comment || "").trim(),
                swapRequest: swapRequestId || null,
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const updatedStats = await recalculateUserRating(targetUserId);

    const io = req.app.get("io") || global.io;
    if (io) {
        io.emit("user_rating_updated", {
            reviewerId: reviewerId.toString(),
            userId: targetUserId.toString(),
            rating: updatedStats.rating,
            reviews: updatedStats.reviews,
            myRating: numericRating,
        });
    }

    res.status(200).json({
        success: true,
        message: "Review submitted successfully.",
        data: {
            review,
            targetUserStats: updatedStats,
            myRating: numericRating,
        },
    });
});

/**
 * Get reviews for a specific user
 */
export const getUserReviews = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID format.");
    }

    const reviews = await Review.find({ targetUser: userId })
        .populate("reviewer", "name avatar headline")
        .sort({ createdAt: -1 })
        .lean();

    const formattedReviews = reviews.map((r) => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        reviewer: r.reviewer
            ? {
                id: r.reviewer._id,
                name: r.reviewer.name || "Anonymous",
                avatar: r.reviewer.avatar?.url || (typeof r.reviewer.avatar === "string" ? r.reviewer.avatar : null),
                headline: r.reviewer.headline || "",
            }
            : null,
    }));

    const stats = await recalculateUserRating(userId);

    res.status(200).json({
        success: true,
        message: "User reviews retrieved successfully.",
        data: {
            reviews: formattedReviews,
            stats,
        },
    });
});

/**
 * Get current user's review for a target user
 */
export const getMyReviewForUser = asyncHandler(async (req, res) => {
    const reviewerId = req.user._id;
    const { targetUserId } = req.params;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(200).json({ success: true, data: { myRating: 0 } });
    }

    const review = await Review.findOne({
        reviewer: reviewerId,
        targetUser: targetUserId,
    }).lean();

    res.status(200).json({
        success: true,
        data: {
            myRating: review ? review.rating : 0,
            comment: review ? review.comment : "",
        },
    });
});
