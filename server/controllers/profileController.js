import User from "../models/User.js";

import { ApiError } from "../utils/ApiError.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import {
    comparePassword,
    hashPassword,
} from "../utils/auth.utils.js";

import {
    calculateProfileCompletion,
    sanitizeProfile,
} from "../utils/profile.utils.js";

export const getMyProfile = asyncHandler(
    async (req, res) => {
        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            throw new ApiError(
                404,
                "User profile was not found.",
                [],
                "PROFILE_NOT_FOUND"
            );
        }

        const calculatedCompletion =
            calculateProfileCompletion(user);

        if (
            user.profileCompletion !==
            calculatedCompletion
        ) {
            user.profileCompletion =
                calculatedCompletion;

            await user.save();
        }

        res.status(200).json({
            success: true,

            message:
                "Profile retrieved successfully.",

            data: {
                user: sanitizeProfile(user),
            },
        });
    }
);

export const updateMyProfile = asyncHandler(
    async (req, res) => {
        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            throw new ApiError(
                404,
                "User profile was not found.",
                [],
                "PROFILE_NOT_FOUND"
            );
        }

        const {
            name,
            headline,
            bio,
            location,
            socialLinks,
        } = req.body;

        if (name !== undefined) {
            user.name = name;
        }

        if (headline !== undefined) {
            user.headline = headline;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        if (location !== undefined) {
            user.location = {
                city:
                    location.city ??
                    user.location?.city ??
                    "",

                state:
                    location.state ??
                    user.location?.state ??
                    "",

                country:
                    location.country ??
                    user.location?.country ??
                    "",
            };
        }

        if (socialLinks !== undefined) {
            user.socialLinks = {
                github:
                    socialLinks.github ??
                    user.socialLinks?.github ??
                    "",

                linkedin:
                    socialLinks.linkedin ??
                    user.socialLinks?.linkedin ??
                    "",

                portfolio:
                    socialLinks.portfolio ??
                    user.socialLinks?.portfolio ??
                    "",
            };
        }

        user.profileCompletion =
            calculateProfileCompletion(user);

        await user.save();

        res.status(200).json({
            success: true,

            message:
                "Profile updated successfully.",

            data: {
                user: sanitizeProfile(user),
            },
        });
    }
);

export const changeMyPassword = asyncHandler(
    async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select("+passwordHash");

        if (!user) {
            throw new ApiError(
                404,
                "User profile was not found.",
                [],
                "PROFILE_NOT_FOUND"
            );
        }

        const isPasswordCorrect = await comparePassword(
            currentPassword,
            user.passwordHash
        );

        if (!isPasswordCorrect) {
            throw new ApiError(
                400,
                "Incorrect current password.",
                [],
                "INCORRECT_CURRENT_PASSWORD"
            );
        }

        user.passwordHash = await hashPassword(newPassword);
        user.passwordChangedAt = Date.now();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    }
);