import User from "../models/User.js";
import Skill from "../models/Skill.js";
import Chat from "../models/Chat.js";

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

export const getUserProfileById = asyncHandler(
    async (req, res) => {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user || user.accountStatus !== "active") {
            throw new ApiError(
                404,
                "User profile was not found.",
                [],
                "PROFILE_NOT_FOUND"
            );
        }

        const skills = await Skill.find({ owner: id, isActive: true }).lean();
        
        const teachSkills = skills.filter((skill) => skill.type === "teach");
        const learnSkills = skills.filter((skill) => skill.type === "learn");

        let isConnected = false;
        let chatId = null;

        if (req.user && req.user._id !== "static_admin_id") {
            const existingChat = await Chat.findOne({
                participants: { $all: [req.user._id, user._id] }
            }).lean();

            if (existingChat) {
                isConnected = true;
                chatId = existingChat._id;
            }
        }

        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully.",
            data: {
                user: sanitizeProfile(user),
                teachSkills,
                learnSkills,
                isConnected,
                chatId,
            },
        });
    }
);

export const getAllProfiles = asyncHandler(
    async (req, res) => {
        const query = {
            accountStatus: "active",
        };
        if (req.user && req.user._id !== "static_admin_id") {
            query._id = { $ne: req.user._id };
        }

        const users = await User.find(query).lean();

        const allSkills = await Skill.find({ isActive: true }).lean();

        const formattedUsers = users.map(user => {
            const userSkills = allSkills.filter(
                skill => skill.owner.toString() === user._id.toString()
            );

            const teachSkills = userSkills.filter(s => s.type === "teach");
            const learnSkills = userSkills.filter(s => s.type === "learn");
            
            const mainSkill = teachSkills[0] || learnSkills[0] || {};

            return {
                ...sanitizeProfile(user),
                teaches: teachSkills.map(s => s.title),
                wants: learnSkills.map(s => s.title),
                category: mainSkill.category || "all",
                level: mainSkill.level || "all",
                mode: mainSkill.teachingMode || mainSkill.learningMode || "all",
            };
        });

        res.status(200).json({
            success: true,
            message: "Profiles retrieved successfully.",
            data: formattedUsers,
        });
    }
);