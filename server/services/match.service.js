import mongoose from "mongoose";
import Skill from "../models/Skill.js";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";

import {
    arraySimilarity,
    textSimilarity,
} from "../utils/textSimilarity.js";

import { expandLearnSkillsIntent } from "./skillAi.service.js";

/*
|--------------------------------------------------------------------------
| Match engine
|--------------------------------------------------------------------------
|
| Scores how well another member fits the current user, and explains why.
| Uses AI expansion for "Skills I Want" to recommend direct skill matches
| as well as related skills the user could learn.
|
*/

const WEIGHTS = {
    skill: 0.4,
    level: 0.2,
    availability: 0.15,
    mode: 0.1,
    location: 0.1,
    trust: 0.05,
};

const LEVEL_RANK = {
    "complete-beginner": 0,
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
};

const CANDIDATE_LIMIT = 600;

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toRank = (level) =>
    LEVEL_RANK[level] === undefined ? null : LEVEL_RANK[level];

const skillScore = (teachSkill, learnSkill, aiExpanded = null) => {
    const titleScore = textSimilarity(teachSkill.title, learnSkill.title);

    // Only compare actual tags, DO NOT include broad category strings
    const tagScore = arraySimilarity(
        teachSkill.tags || [],
        learnSkill.tags || []
    );

    const goalScore = textSimilarity(
        teachSkill.title,
        learnSkill.learningGoal
    );

    let directMatchScore = Math.max(titleScore, 0.8 * tagScore, 0.6 * goalScore);

    // Small bonus if categories match AND there is already a non-zero title/tag/goal match
    if (
        directMatchScore > 0 &&
        teachSkill.category &&
        learnSkill.category &&
        teachSkill.category === learnSkill.category
    ) {
        directMatchScore = Math.min(1, directMatchScore + 0.1);
    }

    if (directMatchScore >= 0.35) {
        return {
            score: directMatchScore,
            isRelatedMatch: false,
            relatedSkillTitle: null,
        };
    }

    // Check AI expanded related skills for what user wants to learn
    if (aiExpanded && Array.isArray(aiExpanded.relatedSkills)) {
        for (const relatedSkill of aiExpanded.relatedSkills) {
            const relScore = textSimilarity(teachSkill.title, relatedSkill);

            if (relScore >= 0.5) {
                return {
                    score: Math.min(0.85, 0.6 + relScore * 0.25),
                    isRelatedMatch: true,
                    relatedSkillTitle: relatedSkill,
                };
            }
        }
    }

    return {
        score: 0,
        isRelatedMatch: false,
        relatedSkillTitle: null,
    };
};

const levelScore = (teachSkill, learnSkill) => {
    const teacherRank = toRank(teachSkill.level);
    const targetRank = toRank(learnSkill.targetLevel);

    if (teacherRank === null || targetRank === null) {
        return 0.5;
    }

    if (teacherRank >= targetRank) {
        const gap = teacherRank - targetRank;
        return gap <= 2 ? 1 : 0.8;
    }

    return teacherRank + 1 === targetRank ? 0.5 : 0.2;
};

const availabilityScore = (teachSkill, learnSkill) => {
    const teachAvailability = teachSkill.availability || {};
    const learnAvailability = learnSkill.availability || {};

    const teachDays = new Set(teachAvailability.days || []);
    const learnDays = learnAvailability.days || [];

    const sharedDays = learnDays.filter((day) => teachDays.has(day));

    const daysScore =
        teachDays.size === 0 || learnDays.length === 0
            ? 0.5
            : Math.min(1, sharedDays.length / 2);

    const teachSlot = teachAvailability.timeSlot || "flexible";
    const learnSlot = learnAvailability.timeSlot || "flexible";

    const slotScore =
        teachSlot === learnSlot ||
        teachSlot === "flexible" ||
        learnSlot === "flexible"
            ? 1
            : 0;

    return 0.6 * daysScore + 0.4 * slotScore;
};

const modeScore = (teachSkill, learnSkill) => {
    const teachMode = teachSkill.teachingMode || "both";
    const learnMode = learnSkill.preferredLearningMode || "both";

    if (teachMode === "both" || learnMode === "both") {
        return 0.85;
    }

    return teachMode === learnMode ? 1 : 0;
};

const locationScore = (viewer, candidate, needsOffline) => {
    const viewerLocation = viewer.location || {};
    const candidateLocation = candidate.location || {};

    const sameCity =
        viewerLocation.city &&
        candidateLocation.city &&
        viewerLocation.city.toLowerCase() ===
            candidateLocation.city.toLowerCase();

    const sameState =
        viewerLocation.state &&
        candidateLocation.state &&
        viewerLocation.state.toLowerCase() ===
            candidateLocation.state.toLowerCase();

    if (sameCity) {
        return 1;
    }

    if (sameState) {
        return 0.7;
    }

    return needsOffline ? 0.2 : 0.6;
};

const trustScore = (candidate) => {
    const completion = (candidate.profileCompletion || 0) / 100;
    const verified = candidate.isEmailVerified ? 1 : 0;
    const hasAvatar = candidate.avatar?.url ? 1 : 0;

    return 0.6 * completion + 0.3 * verified + 0.1 * hasAvatar;
};

const scorePair = (teachSkill, learnSkill, teacher, learner, aiExpanded = null) => {
    const needsOffline =
        teachSkill.teachingMode === "offline" ||
        learnSkill.preferredLearningMode === "offline";

    const { score: sScore, isRelatedMatch, relatedSkillTitle } = skillScore(
        teachSkill,
        learnSkill,
        aiExpanded
    );

    const parts = {
        skill: sScore,
        level: levelScore(teachSkill, learnSkill),
        availability: availabilityScore(teachSkill, learnSkill),
        mode: modeScore(teachSkill, learnSkill),
        location: locationScore(learner, teacher, needsOffline),
        trust: trustScore(teacher),
    };

    const score = Object.entries(WEIGHTS).reduce(
        (total, [key, weight]) => total + weight * parts[key],
        0
    );

    return {
        parts,
        score,
        isRelatedMatch,
        relatedSkillTitle,
    };
};

const humanDays = (days = []) =>
    days
        .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
        .join(", ");

const buildReasons = ({ parts, teachSkill, learnSkill, teacher, isRelatedMatch, relatedSkillTitle }) => {
    const reasons = [];

    if (isRelatedMatch) {
        reasons.push(
            `AI Suggested Related Skill: "${teachSkill.title}" complements your goal to learn "${learnSkill.title}"`
        );
    } else if (parts.skill >= 0.85) {
        reasons.push(
            `Exact skill match: "${teachSkill.title}" matches your goal to learn "${learnSkill.title}"`
        );
    } else if (parts.skill > 0) {
        reasons.push(
            `Related skill fit: "${teachSkill.title}" covers what you need for "${learnSkill.title}"`
        );
    }

    if (parts.level >= 1 && teachSkill.level) {
        reasons.push(
            `${teachSkill.level} teacher for your ${learnSkill.targetLevel || "learning"} goal`
        );
    }

    if (parts.availability >= 0.8) {
        const teachDays = new Set(teachSkill.availability?.days || []);

        const sharedDays = (learnSkill.availability?.days || []).filter(
            (day) => teachDays.has(day)
        );

        reasons.push(
            sharedDays.length
                ? `Both free on ${humanDays(sharedDays)}`
                : "Flexible schedules on both sides"
        );
    }

    if (parts.mode >= 1) {
        reasons.push(`Both prefer ${teachSkill.teachingMode} sessions`);
    }

    if (parts.location >= 1) {
        reasons.push(`Same city — ${teacher.location?.city}`);
    }

    if (teachSkill.yearsOfExperience >= 2) {
        reasons.push(
            `${teachSkill.yearsOfExperience}+ years of hands-on experience`
        );
    }

    return reasons.slice(0, 4);
};

const formatSkillRef = (skill) => ({
    id: skill._id,
    title: skill.title,
    category: skill.category,
    level: skill.level,
    targetLevel: skill.targetLevel,
    tags: skill.tags || [],
});

const formatUserRef = (user) => ({
    id: user._id,
    name: user.name,
    headline: user.headline,
    avatar: user.avatar?.url || null,

    location: [user.location?.city, user.location?.country]
        .filter(Boolean)
        .join(", "),

    profileCompletion: user.profileCompletion || 0,
    isEmailVerified: Boolean(user.isEmailVerified),
});

/**
 * Ranked list of members the given user should swap skills with.
 * Priority signal is "Skills I Want" (`myLearnSkills`).
 */
export const findMatchesForUser = async (
    userId,
    { limit = 10, minScore = 0.2 } = {}
) => {
    if (!userId || userId === "static_admin_id" || !mongoose.Types.ObjectId.isValid(userId)) {
        return { matches: [], hasTeachSkills: false, hasLearnSkills: false };
    }

    const viewer = await User.findById(userId).lean();

    if (!viewer) {
        return { matches: [], hasTeachSkills: false, hasLearnSkills: false };
    }

    const mySkills = await Skill.find({
        owner: userId,
        isActive: true,
    }).lean();

    const myTeachSkills = mySkills.filter((skill) => skill.type === "teach");
    const myLearnSkills = mySkills.filter((skill) => skill.type === "learn");

    const hasTeachSkills = myTeachSkills.length > 0;
    const hasLearnSkills = myLearnSkills.length > 0;

    if (!hasTeachSkills && !hasLearnSkills) {
        return { matches: [], hasTeachSkills, hasLearnSkills };
    }

    // AI Expansion for "Skills I Want"
    const aiExpanded = await expandLearnSkillsIntent(myLearnSkills);

    const searchCategories = [
        ...new Set([
            ...mySkills.map((skill) => skill.category),
            ...(aiExpanded.categories || []),
        ]),
    ];

    const searchTagsAndKeywords = [
        ...new Set([
            ...mySkills.flatMap((skill) => skill.tags || []),
            ...(aiExpanded.directKeywords || []),
        ]),
    ];

    const regexTerms = [
        ...(aiExpanded.relatedSkills || []),
        ...(aiExpanded.directKeywords || []),
    ].filter(Boolean);

    const regexPatterns = regexTerms.map(
        (term) => new RegExp(escapeRegex(term), "i")
    );

    let candidateSkills = await Skill.find({
        owner: {
            $ne: userId,
        },
        isActive: true,
        $or: [
            { category: { $in: searchCategories } },
            { tags: { $in: searchTagsAndKeywords } },
            ...(regexPatterns.length > 0
                ? [
                      { title: { $in: regexPatterns } },
                      { description: { $in: regexPatterns } },
                  ]
                : []),
        ],
    })
        .limit(CANDIDATE_LIMIT)
        .lean();

    // Fallback: if no direct category/tag candidate skills found, query active teach skills from other members
    if (candidateSkills.length === 0) {
        candidateSkills = await Skill.find({
            owner: { $ne: userId },
            isActive: true,
            type: "teach",
        })
            .limit(100)
            .lean();
    }

    if (candidateSkills.length === 0) {
        return { matches: [], hasTeachSkills, hasLearnSkills };
    }

    const candidateUserIds = [
        ...new Set(
            candidateSkills.map((skill) => skill.owner.toString())
        ),
    ];

    const candidateUsers = await User.find({
        _id: {
            $in: candidateUserIds,
        },
        accountStatus: "active",
    }).lean();

    const usersById = new Map(
        candidateUsers.map((user) => [user._id.toString(), user])
    );

    const acceptedRequests = await SwapRequest.find({
        status: "accepted",
        $or: [
            { sender: userId, receiver: { $in: candidateUserIds } },
            { receiver: userId, sender: { $in: candidateUserIds } },
        ],
    }).lean();

    const connectedUserIds = new Set(
        acceptedRequests.map((req) =>
            req.sender.toString() === userId.toString()
                ? req.receiver.toString()
                : req.sender.toString()
        )
    );

    const skillsByOwner = candidateSkills.reduce((map, skill) => {
        const ownerId = skill.owner.toString();

        if (!usersById.has(ownerId)) {
            return map;
        }

        const bucket = map.get(ownerId) || [];
        bucket.push(skill);
        map.set(ownerId, bucket);

        return map;
    }, new Map());

    const matches = [];

    for (const [ownerId, ownerSkills] of skillsByOwner) {
        const candidate = usersById.get(ownerId);

        const theyTeach = ownerSkills.filter(
            (skill) => skill.type === "teach"
        );

        const theyLearn = ownerSkills.filter(
            (skill) => skill.type === "learn"
        );

        let bestIncoming = null;
        let bestOutgoing = null;

        for (const teachSkill of theyTeach) {
            for (const learnSkill of myLearnSkills) {
                const { score, parts, isRelatedMatch, relatedSkillTitle } = scorePair(
                    teachSkill,
                    learnSkill,
                    candidate,
                    viewer,
                    aiExpanded
                );

                if (parts.skill === 0) {
                    continue;
                }

                if (!bestIncoming || score > bestIncoming.score) {
                    bestIncoming = {
                        score,
                        parts,
                        teachSkill,
                        learnSkill,
                        isRelatedMatch,
                        relatedSkillTitle,
                    };
                }
            }
        }

        for (const teachSkill of myTeachSkills) {
            for (const learnSkill of theyLearn) {
                // Skip if viewer and candidate are teaching the exact same skill title (avoid "they teach React, you teach React")
                if (
                    bestIncoming &&
                    textSimilarity(teachSkill.title, bestIncoming.teachSkill.title) >= 0.8
                ) {
                    continue;
                }

                const { score, parts } = scorePair(
                    teachSkill,
                    learnSkill,
                    viewer,
                    candidate,
                    null
                );

                if (parts.skill === 0) {
                    continue;
                }

                if (!bestOutgoing || score > bestOutgoing.score) {
                    bestOutgoing = {
                        score,
                        parts,
                        teachSkill,
                        learnSkill,
                    };
                }
            }
        }

        // Recommend candidates who teach what the user wants to learn (or AI related skills)
        if (!bestIncoming) {
            continue;
        }

        const isMutual = Boolean(bestIncoming && bestOutgoing);

        const baseScore = isMutual
            ? 0.6 * bestIncoming.score + 0.4 * bestOutgoing.score
            : bestIncoming.score;

        const finalScore = Math.min(1, isMutual ? baseScore * 1.15 : baseScore);

        if (finalScore < minScore) {
            continue;
        }

        const reasons = [];

        if (isMutual) {
            reasons.push(
                `Perfect swap: they teach ${bestIncoming.teachSkill.title}, you teach ${bestOutgoing.teachSkill.title}`
            );
        }

        reasons.push(
            ...buildReasons({
                parts: bestIncoming.parts,
                teachSkill: bestIncoming.teachSkill,
                learnSkill: bestIncoming.learnSkill,
                teacher: candidate,
                isRelatedMatch: bestIncoming.isRelatedMatch,
                relatedSkillTitle: bestIncoming.relatedSkillTitle,
            })
        );

        matches.push({
            user: formatUserRef(candidate),
            score: Math.round(finalScore * 100),
            mutual: isMutual,
            isRelatedMatch: Boolean(bestIncoming.isRelatedMatch),
            isConnected: connectedUserIds.has(ownerId),

            theyTeach: bestIncoming
                ? formatSkillRef(bestIncoming.teachSkill)
                : null,

            youWant: bestIncoming
                ? formatSkillRef(bestIncoming.learnSkill)
                : null,

            youTeach: bestOutgoing
                ? formatSkillRef(bestOutgoing.teachSkill)
                : null,

            theyWant: bestOutgoing
                ? formatSkillRef(bestOutgoing.learnSkill)
                : null,

            reasons: [...new Set(reasons)].slice(0, 4),

            breakdown: Object.fromEntries(
                Object.entries(
                    bestIncoming.parts
                ).map(([key, value]) => [key, Math.round(value * 100)])
            ),
        });
    }

    return {
        matches: matches
            .sort((left, right) => right.score - left.score)
            .slice(0, limit),
        hasTeachSkills,
        hasLearnSkills,
    };
};

export const matchWeights = WEIGHTS;
