import Skill from "../models/Skill.js";
import SwapRequest from "../models/SwapRequest.js";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { aiStatus } from "../services/ai.service.js";
import { textSimilarity } from "../utils/textSimilarity.js";

import {
    extractSkillsFromText,
    generateIcebreaker,
    generateLearningRoadmap,
    parseSearchIntent,
} from "../services/skillAi.service.js";

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAiStatus = asyncHandler(async (_req, res) => {
    return res.status(200).json({
        success: true,
        message: "AI status retrieved successfully",
        data: aiStatus(),
    });
});

/**
 * Natural-language skill search: the query is expanded into keywords
 * (by the LLM when available, by the synonym map otherwise) and results
 * are re-ranked by similarity instead of raw text-index order.
 */
export const semanticSearch = asyncHandler(async (req, res) => {
    const query = String(req.query.q || req.body?.q || "").trim();

    if (query.length < 2) {
        throw new ApiError(
            400,
            "Search query must contain at least 2 characters",
            [],
            "INVALID_SEARCH_QUERY"
        );
    }

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const intent = await parseSearchIntent(query);

    const keywordPatterns = intent.keywords.map(
        (keyword) => new RegExp(escapeRegex(keyword), "i")
    );

    const filters = {
        type: "teach",
        isActive: true,

        owner: {
            $ne: req.user._id,
        },
    };

    if (intent.category) {
        filters.category = intent.category;
    }

    if (intent.mode) {
        filters.teachingMode = {
            $in: [intent.mode, "both"],
        };
    }

    if (keywordPatterns.length) {
        filters.$or = [
            {
                title: {
                    $in: keywordPatterns,
                },
            },
            {
                tags: {
                    $in: keywordPatterns,
                },
            },
            {
                description: {
                    $in: keywordPatterns,
                },
            },
        ];
    }

    const skills = await Skill.find(filters)
        .populate("owner", "name headline avatar location profileCompletion")
        .limit(200)
        .lean();

    const results = skills
        .map((skill) => {
            const haystack = [
                skill.title,
                ...(skill.tags || []),
                skill.category,
            ].join(" ");

            const relevance = Math.max(
                ...intent.keywords.map((keyword) =>
                    Math.max(
                        textSimilarity(keyword, skill.title),
                        0.8 * textSimilarity(keyword, haystack)
                    )
                ),
                textSimilarity(query, skill.title)
            );

            return {
                id: skill._id,
                title: skill.title,
                category: skill.category,
                level: skill.level,
                description: skill.description,
                teachingMode: skill.teachingMode,
                yearsOfExperience: skill.yearsOfExperience,
                tags: skill.tags || [],

                owner: skill.owner
                    ? {
                        id: skill.owner._id,
                        name: skill.owner.name,
                        headline: skill.owner.headline,
                        avatar: skill.owner.avatar?.url || null,

                        location: [
                            skill.owner.location?.city,
                            skill.owner.location?.country,
                        ]
                            .filter(Boolean)
                            .join(", "),
                    }
                    : null,

                relevance: Math.round(relevance * 100),
            };
        })
        .filter((result) => result.relevance > 0)
        .sort((left, right) => right.relevance - left.relevance)
        .slice(0, limit);

    return res.status(200).json({
        success: true,
        message: "Search results retrieved successfully",
        data: {
            query,
            interpretedAs: intent.keywords,
            usedAi: intent.source === "ai",
            results,
            count: results.length,
        },
    });
});

export const suggestSkillsFromBio = asyncHandler(async (req, res) => {
    const text = String(req.body?.text || "").trim();

    if (text.length < 30) {
        throw new ApiError(
            400,
            "Please provide at least 30 characters of text",
            [],
            "INVALID_INPUT"
        );
    }

    const suggestion = await extractSkillsFromText(text);

    return res.status(200).json({
        success: true,
        message: "Skill suggestions generated successfully",
        data: {
            ...suggestion,
            usedAi: suggestion.source === "ai",
        },
    });
});

const loadParticipantRequest = async (requestId, userId) => {
    const request = await SwapRequest.findOne({
        _id: requestId,
        $or: [
            {
                sender: userId,
            },
            {
                receiver: userId,
            },
        ],
    })
        .populate("senderSkill")
        .populate("receiverSkill");

    if (!request) {
        throw new ApiError(
            404,
            "Swap request was not found",
            [],
            "SWAP_REQUEST_NOT_FOUND"
        );
    }

    return request;
};

export const getSwapRoadmap = asyncHandler(async (req, res) => {
    const request = await loadParticipantRequest(
        req.params.requestId,
        req.user._id
    );

    return res.status(200).json({
        success: true,
        message: "Roadmap retrieved successfully",
        data: {
            roadmap: request.roadmap || null,
        },
    });
});

/**
 * Builds (or rebuilds) the week-by-week plan for an accepted swap.
 */
export const createSwapRoadmap = asyncHandler(async (req, res) => {
    const request = await loadParticipantRequest(
        req.params.requestId,
        req.user._id
    );

    if (request.status !== "accepted") {
        throw new ApiError(
            409,
            "A roadmap can only be generated for an accepted swap",
            [],
            "SWAP_REQUEST_NOT_ACCEPTED"
        );
    }

    if (request.roadmap?.weeks?.length && !req.body?.regenerate) {
        return res.status(200).json({
            success: true,
            message: "Roadmap retrieved successfully",
            data: {
                roadmap: request.roadmap,
            },
        });
    }

    const learnSkill = [request.senderSkill, request.receiverSkill].find(
        (skill) => skill?.type === "learn"
    );

    const teachSkill = [request.senderSkill, request.receiverSkill].find(
        (skill) => skill?.type === "teach"
    );

    const roadmap = await generateLearningRoadmap({
        skillTitle: teachSkill?.title || learnSkill?.title,
        currentLevel: learnSkill?.currentLevel,
        targetLevel: learnSkill?.targetLevel,
        learningGoal: learnSkill?.learningGoal,
        teacherLevel: teachSkill?.level,
    });

    if (!roadmap) {
        throw new ApiError(
            422,
            "Roadmap could not be generated for this swap",
            [],
            "ROADMAP_GENERATION_FAILED"
        );
    }

    request.roadmap = {
        ...roadmap,
        generatedBy: req.user._id,
        generatedAt: new Date(),
    };

    await request.save();

    return res.status(201).json({
        success: true,
        message: "Roadmap generated successfully",
        data: {
            roadmap: request.roadmap,
        },
    });
});

export const getIcebreaker = asyncHandler(async (req, res) => {
    const { receiverName, youTeach, youWant } = req.body || {};

    const icebreaker = await generateIcebreaker({
        senderName: req.user.name,
        receiverName,
        youTeach,
        youWant,
    });

    return res.status(200).json({
        success: true,
        message: "Message suggestion generated successfully",
        data: {
            ...icebreaker,
            usedAi: icebreaker.source === "ai",
        },
    });
});
