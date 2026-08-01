import Skill from "../models/Skill.js";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";

import {
    arraySimilarity,
    textSimilarity,
} from "../utils/textSimilarity.js";

/*
|--------------------------------------------------------------------------
| Match engine
|--------------------------------------------------------------------------
|
| Scores how well another member fits the current user, and explains why.
| Deterministic and dependency-free: it is the fallback that keeps
| recommendations working even when the AI provider is unavailable.
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

const toRank = (level) =>
    LEVEL_RANK[level] === undefined ? null : LEVEL_RANK[level];

const skillScore = (teachSkill, learnSkill) => {
    const titleScore = textSimilarity(teachSkill.title, learnSkill.title);

    const tagScore = arraySimilarity(
        [...(teachSkill.tags || []), teachSkill.category],
        [...(learnSkill.tags || []), learnSkill.category]
    );

    const goalScore = textSimilarity(
        teachSkill.title,
        learnSkill.learningGoal
    );

    return Math.min(
        1,
        Math.max(titleScore, 0.75 * tagScore, 0.5 * goalScore)
    );
};

const levelScore = (teachSkill, learnSkill) => {
    const teacherRank = toRank(teachSkill.level);
    const targetRank = toRank(learnSkill.targetLevel);

    if (teacherRank === null || targetRank === null) {
        return 0.5;
    }

    if (teacherRank >= targetRank) {
        // Slight penalty for a huge gap: an expert teaching an absolute
        // beginner is a worse fit than someone one step ahead.
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

    // Online-only pairs barely care about distance.
    return needsOffline ? 0.2 : 0.6;
};

const trustScore = (candidate) => {
    const completion = (candidate.profileCompletion || 0) / 100;
    const verified = candidate.isEmailVerified ? 1 : 0;
    const hasAvatar = candidate.avatar?.url ? 1 : 0;

    return 0.6 * completion + 0.3 * verified + 0.1 * hasAvatar;
};

const scorePair = (teachSkill, learnSkill, teacher, learner) => {
    const needsOffline =
        teachSkill.teachingMode === "offline" ||
        learnSkill.preferredLearningMode === "offline";

    const parts = {
        skill: skillScore(teachSkill, learnSkill),
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
    };
};

const humanDays = (days = []) =>
    days
        .map((day) => day.charAt(0).toUpperCase() + day.slice(1, 3))
        .join(", ");

const buildReasons = ({ parts, teachSkill, learnSkill, teacher }) => {
    const reasons = [];

    if (parts.skill >= 0.85) {
        reasons.push(
            `Exact skill match: "${teachSkill.title}" ↔ "${learnSkill.title}"`
        );
    } else if (parts.skill > 0) {
        reasons.push(
            `Related skills: "${teachSkill.title}" covers what you need for "${learnSkill.title}"`
        );
    }

    if (parts.level >= 1 && teachSkill.level) {
        reasons.push(
            `${teachSkill.level} teacher for your ${learnSkill.targetLevel} goal`
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
 *
 * A "swap" is scored in both directions: what they can teach you, and
 * what you can teach them. Pairs where both directions work are marked
 * `mutual` and boosted, because those are the swaps that actually happen.
 */
export const findMatchesForUser = async (
    userId,
    { limit = 10, minScore = 0.25 } = {}
) => {
    const viewer = await User.findById(userId).lean();

    if (!viewer) {
        return [];
    }

    const mySkills = await Skill.find({
        owner: userId,
        isActive: true,
    }).lean();

    const myTeachSkills = mySkills.filter((skill) => skill.type === "teach");
    const myLearnSkills = mySkills.filter((skill) => skill.type === "learn");

    if (myTeachSkills.length === 0 && myLearnSkills.length === 0) {
        return [];
    }

    const interestingCategories = [
        ...new Set(mySkills.map((skill) => skill.category)),
    ];

    const candidateSkills = await Skill.find({
        owner: {
            $ne: userId,
        },
        isActive: true,
        $or: [
            {
                category: {
                    $in: interestingCategories,
                },
            },
            {
                tags: {
                    $in: [
                        ...new Set(
                            mySkills.flatMap((skill) => skill.tags || [])
                        ),
                    ],
                },
            },
        ],
    })
        .limit(CANDIDATE_LIMIT)
        .lean();

    if (candidateSkills.length === 0) {
        return [];
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
                const { score, parts } = scorePair(
                    teachSkill,
                    learnSkill,
                    candidate,
                    viewer
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
                    };
                }
            }
        }

        for (const teachSkill of myTeachSkills) {
            for (const learnSkill of theyLearn) {
                const { score, parts } = scorePair(
                    teachSkill,
                    learnSkill,
                    viewer,
                    candidate
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

        // User strictly wants candidates who teach what they want to learn
        // (Includes related skills)
        if (!bestIncoming) {
            continue;
        }

        const isMutual = Boolean(bestIncoming && bestOutgoing);

        const baseScore = isMutual
            ? 0.6 * bestIncoming.score + 0.4 * bestOutgoing.score
            : (bestIncoming || bestOutgoing).score;

        // A two-way swap needs no favours from either side, so it ranks first.
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

        if (bestIncoming) {
            reasons.push(
                ...buildReasons({
                    parts: bestIncoming.parts,
                    teachSkill: bestIncoming.teachSkill,
                    learnSkill: bestIncoming.learnSkill,
                    teacher: candidate,
                })
            );
        } else {
            reasons.push(
                ...buildReasons({
                    parts: bestOutgoing.parts,
                    teachSkill: bestOutgoing.teachSkill,
                    learnSkill: bestOutgoing.learnSkill,
                    teacher: viewer,
                })
            );
        }

        matches.push({
            user: formatUserRef(candidate),
            score: Math.round(finalScore * 100),
            mutual: isMutual,
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
                    (bestIncoming || bestOutgoing).parts
                ).map(([key, value]) => [key, Math.round(value * 100)])
            ),
        });
    }

    return matches
        .sort((left, right) => right.score - left.score)
        .slice(0, limit);
};

export const matchWeights = WEIGHTS;
