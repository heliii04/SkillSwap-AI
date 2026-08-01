import { asyncHandler } from "../utils/asyncHandler.js";
import { findMatchesForUser } from "../services/match.service.js";

export const getMyMatches = asyncHandler(async (req, res) => {
    const limit = Math.min(
        Number(req.query.limit) || 10,
        50
    );

    const matches = await findMatchesForUser(req.user._id, {
        limit,
    });

    return res.status(200).json({
        success: true,
        message: "Matches retrieved successfully",
        data: {
            matches,
            count: matches.length,
        },
    });
});
