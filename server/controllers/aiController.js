import mongoose from "mongoose";
import Skill from "../models/Skill.js";
import SwapRequest from "../models/SwapRequest.js";
import LearningRoadmap from "../models/LearningRoadmap.js";
import AIChatHistory from "../models/AIChatHistory.js";
import QuizResult from "../models/QuizResult.js";

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

import {
    chatWithGemini,
    streamChatWithGemini,
    generateStructuredContent,
    roadmapSchema,
    nextFocusSchema,
    dailyPlanSchema,
    quizSchema
} from "../services/gemini.service.js";

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
    };

    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
        filters.owner = {
            $ne: req.user._id,
        };
    }

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

export const getAiChatSessions = asyncHandler(async (req, res) => {
    const sessions = await AIChatHistory.find({
        user: req.user._id,
        "messages.0": { $exists: true },
    })
        .sort({ updatedAt: -1 })
        .lean();

    const formatted = sessions.map((s) => ({
        id: s.sessionId,
        title: s.title || "Conversation",
        updatedAt: s.updatedAt,
        messages: (s.messages || []).map((m) => ({
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp,
        })),
    }));

    return res.status(200).json({
        success: true,
        data: {
            sessions: formatted,
        },
    });
});

export const deleteAiChatSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    await AIChatHistory.deleteOne({
        user: req.user._id,
        sessionId,
    });

    return res.status(200).json({
        success: true,
        message: "AI chat session deleted successfully",
    });
});

export const clearAllAiChatHistory = asyncHandler(async (req, res) => {
    await AIChatHistory.deleteMany({
        user: req.user._id,
    });

    return res.status(200).json({
        success: true,
        message: "All AI chat history cleared successfully",
    });
});

export const chatDiscussion = asyncHandler(async (req, res) => {
    const { message, history, sessionId } = req.body;
    const activeSessionId = sessionId || Date.now().toString();

    // 1. We match for SkillSwap context if user asks about learning a skill.
    let systemContext =
        "You are a helpful AI assistant for SkillSwap, a platform for learning and teaching skills. Default to responding in English unless the user explicitly speaks or requests Hindi or Gujarati. STRICT LIMITATION: You MUST ONLY answer questions related to skills, learning, teaching, or the SkillSwap platform itself. If a user asks something unrelated, inappropriate, or uses bad language, give a VERY SHORT and polite apology (e.g., 'Sorry, I can only help with skill-related topics.'), DO NOT explain further, and DO NOT mention any users. NEVER use bad language. NEVER mention any users on the platform unless the user explicitly asks to learn a specific skill.";

    const lowerMsg = message.toLowerCase();
    const words = lowerMsg
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .split(" ")
        .filter(
            (w) =>
                w.length > 2 &&
                ![
                    "how",
                    "to",
                    "learn",
                    "teach",
                    "seekhna",
                    "want",
                    "can",
                    "you",
                    "help",
                    "me",
                    "with",
                    "what",
                    "is",
                    "the",
                    "for",
                    "and",
                ].includes(w)
        );

    if (words.length > 0) {
        const regexes = words.map((w) => new RegExp(w, "i"));
        const potentialSkills = await Skill.find({
            type: "teach",
            isActive: true,
            $or: [
                { title: { $in: regexes } },
                { tags: { $in: regexes } },
            ],
        })
            .populate("owner", "name headline")
            .limit(5)
            .lean();

        if (potentialSkills.length > 0) {
            const skillContext = potentialSkills
                .map((s) => `${s.owner?.name} teaches ${s.title}`)
                .join(", ");
            systemContext += ` Important context: Here are up to 5 users who teach skills related to the user's query: ${skillContext}. ONLY mention them IF the user explicitly wants to learn these exact skills.`;
        }
    }

    // Convert history to prompt string for simplicity, or just pass message if no history
    let prompt = message;
    if (history && history.length > 0) {
        prompt =
            history
                .map((h) => `${h.role || h.sender}: ${h.content || h.text}`)
                .join("\n") + `\nuser: ${message}`;
    } else {
        systemContext +=
            " This is the very first message of the conversation. You MUST start your response by warmly welcoming the user to SkillSwap (e.g. 'Welcome to SkillSwap! I am your AI Assistant...'). After the welcome, proceed to answer their question or address their message.";
    }

    const aiResponse = await chatWithGemini(prompt, systemContext);

    // Save/update conversation session in MongoDB
    if (req.user?._id) {
        const titleSnippet = message.slice(0, 35) + (message.length > 35 ? "..." : "");
        const userMsg = { sender: "user", text: message, timestamp: new Date() };
        const aiMsg = { sender: "ai", text: aiResponse, timestamp: new Date() };

        await AIChatHistory.findOneAndUpdate(
            { user: req.user._id, sessionId: activeSessionId },
            {
                $setOnInsert: { title: titleSnippet },
                $push: { messages: { $each: [userMsg, aiMsg] } },
            },
            { upsert: true, new: true }
        );
    }

    return res.status(200).json({
        success: true,
        data: {
            reply: aiResponse,
            sessionId: activeSessionId,
        },
    });
});

export const streamChatDiscussion = async (req, res, next) => {
    try {
        const { message, history, sessionId } = req.body || {};
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const activeSessionId = sessionId || Date.now().toString();

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders();

        let systemContext =
            "You are a helpful AI assistant for SkillSwap, a platform for learning and teaching skills. Default to responding in English unless the user explicitly speaks or requests Hindi or Gujarati. STRICT LIMITATION: You MUST ONLY answer questions related to skills, learning, teaching, or the SkillSwap platform itself. If a user asks something unrelated, inappropriate, or uses bad language, give a VERY SHORT and polite apology (e.g., 'Sorry, I can only help with skill-related topics.'), DO NOT explain further, and DO NOT mention any users. NEVER use bad language. NEVER mention any users on the platform unless the user explicitly asks to learn a specific skill.";

        const lowerMsg = message.toLowerCase();
        const words = lowerMsg
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .split(" ")
            .filter(
                (w) =>
                    w.length > 2 &&
                    ![
                        "how",
                        "to",
                        "learn",
                        "teach",
                        "seekhna",
                        "want",
                        "can",
                        "you",
                        "help",
                        "me",
                        "with",
                        "what",
                        "is",
                        "the",
                        "for",
                        "and",
                    ].includes(w)
            );

        if (words.length > 0) {
            const regexes = words.map((w) => new RegExp(w, "i"));
            const potentialSkills = await Skill.find({
                type: "teach",
                isActive: true,
                $or: [
                    { title: { $in: regexes } },
                    { tags: { $in: regexes } },
                ],
            })
                .populate("owner", "name headline")
                .limit(5)
                .lean();

            if (potentialSkills.length > 0) {
                const skillContext = potentialSkills
                    .map((s) => `${s.owner?.name} teaches ${s.title}`)
                    .join(", ");
                systemContext += ` Important context: Here are up to 5 users who teach skills related to the user's query: ${skillContext}. ONLY mention them IF the user explicitly wants to learn these exact skills.`;
            }
        }

        let prompt = message;
        if (history && history.length > 0) {
            prompt =
                history
                    .map((h) => `${h.role || h.sender}: ${h.content || h.text}`)
                    .join("\n") + `\nuser: ${message}`;
        } else {
            systemContext +=
                " This is the very first message of the conversation. You MUST start your response by warmly welcoming the user to SkillSwap (e.g. 'Welcome to SkillSwap! I am your AI Assistant...'). After the welcome, proceed to answer their question or address their message.";
        }

        const onChunk = (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk, sessionId: activeSessionId })}\n\n`);
        };

        const finalContent = await streamChatWithGemini(prompt, systemContext, onChunk);

        res.write("data: [DONE]\n\n");
        res.end();

        if (req.user?._id) {
            const titleSnippet = message.slice(0, 35) + (message.length > 35 ? "..." : "");
            const userMsg = { sender: "user", text: message, timestamp: new Date() };
            const aiMsg = { sender: "ai", text: finalContent, timestamp: new Date() };

            await AIChatHistory.findOneAndUpdate(
                { user: req.user._id, sessionId: activeSessionId },
                {
                    $setOnInsert: { title: titleSnippet },
                    $push: { messages: { $each: [userMsg, aiMsg] } },
                },
                { upsert: true, new: true }
            ).catch((err) => console.error("Error saving AI stream history to DB:", err.message));
        }
    } catch (error) {
        if (!res.headersSent) {
            return next(error);
        }
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
};

export const generatePersonalizedRoadmap = asyncHandler(async (req, res) => {
    const { skill, currentLevel, targetLevel, availableTime, duration, learningStyle } = req.body;
    
    const prompt = `Generate a personalized learning roadmap for the following:
Skill: ${skill}
Current Level: ${currentLevel}
Target Level: ${targetLevel}
Available Time: ${availableTime}
Duration: ${duration}
Learning Style: ${learningStyle}
Create a structured week-by-week plan.`;

    const systemInstruction = "You are an expert tutor. Generate a highly structured roadmap in JSON format matching the schema exactly.";
    
    const roadmapData = await generateStructuredContent(prompt, systemInstruction, roadmapSchema);
    
    // Save to DB
    const newRoadmap = await LearningRoadmap.create({
        user: req.user._id,
        skill,
        currentLevel,
        targetLevel,
        availableTime,
        duration,
        learningStyle,
        weeks: roadmapData.weeks,
        progress: 0
    });
    
    return res.status(201).json({
        success: true,
        message: "Roadmap generated successfully",
        data: { roadmap: newRoadmap }
    });
});

export const updateRoadmapProgress = asyncHandler(async (req, res) => {
    const { roadmapId } = req.params;
    const { weekNumber, taskTitle, isCompleted } = req.body;
    
    const roadmap = await LearningRoadmap.findOne({ _id: roadmapId, user: req.user._id });
    if (!roadmap) {
        throw new ApiError(404, "Roadmap not found");
    }
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (const week of roadmap.weeks) {
        if (week.weekNumber === weekNumber) {
            for (const task of week.tasks) {
                if (task.title === taskTitle) {
                    task.isCompleted = isCompleted;
                }
            }
        }
        for (const task of week.tasks) {
            totalTasks++;
            if (task.isCompleted) completedTasks++;
        }
    }
    
    roadmap.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    await roadmap.save();
    
    const prompt = `User has updated their progress on ${roadmap.skill}. They are now at ${roadmap.progress}% completion. Last task updated: ${taskTitle} (Completed: ${isCompleted}). Based on this, generate an encouraging message and tell them their next focus area.`;
    const systemInstruction = "You are an encouraging AI tutor. Return a structured JSON containing a short message and the next focus.";
    
    const aiResponse = await generateStructuredContent(prompt, systemInstruction, nextFocusSchema);
    
    return res.status(200).json({
        success: true,
        data: {
            roadmap,
            aiMessage: aiResponse.message,
            nextFocus: aiResponse.nextFocus
        }
    });
});

export const getDailyPlan = asyncHandler(async (req, res) => {
    const { roadmapId } = req.params;
    const { availableMinutes } = req.body;
    
    const roadmap = await LearningRoadmap.findOne({ _id: roadmapId, user: req.user._id });
    if (!roadmap) {
        throw new ApiError(404, "Roadmap not found");
    }
    
    const currentWeek = roadmap.weeks.find(w => w.tasks.some(t => !t.isCompleted)) || roadmap.weeks[0];
    
    const prompt = `The user is studying ${roadmap.skill} and is on week ${currentWeek.weekNumber} focusing on ${currentWeek.focus}. They have ${availableMinutes} minutes today. Create a daily study plan for them dividing this time between concept learning, coding/practice, and quiz/review.`;
    const systemInstruction = "Return a JSON plan breaking down the available minutes into activities.";
    
    const planData = await generateStructuredContent(prompt, systemInstruction, dailyPlanSchema);
    
    return res.status(200).json({
        success: true,
        data: planData
    });
});

export const generateQuiz = asyncHandler(async (req, res) => {
    const { topic, numQuestions = 5 } = req.body;
    
    const prompt = `Generate a ${numQuestions}-question quiz on the topic: ${topic}. Include a mix of MCQs and coding/text-based questions if applicable. For MCQs provide exactly 4 options. For coding/text questions, provide an empty array for options. Ensure the questions are highly varied and different from common examples (Randomized Seed: ${Math.random().toString(36).substring(7)} - ${Date.now()}).`;
    const systemInstruction = "You are an expert examiner. Return the quiz in the specified JSON format.";
    
    const quizData = await generateStructuredContent(prompt, systemInstruction, quizSchema);
    
    return res.status(200).json({
        success: true,
        data: quizData
    });
});

export const saveQuizResult = asyncHandler(async (req, res) => {
    const { topic, score, totalQuestions, quizData, userAnswers } = req.body;

    if (!topic || score === undefined || !totalQuestions) {
        throw new ApiError(400, "Topic, score, and totalQuestions are required.");
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    const newResult = await QuizResult.create({
        user: req.user._id,
        topic,
        score,
        totalQuestions,
        percentage,
        quizData: quizData || [],
        userAnswers: userAnswers || {}
    });

    return res.status(201).json({
        success: true,
        message: "Quiz result saved successfully",
        data: { quizResult: newResult }
    });
});

export const getUserQuizResults = asyncHandler(async (req, res) => {
    const results = await QuizResult.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: { quizResults: results }
    });
});

export const deleteQuizResult = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await QuizResult.deleteOne({ _id: id, user: req.user._id });

    return res.status(200).json({
        success: true,
        message: "Quiz result deleted successfully"
    });
});

export const clearAllQuizResults = asyncHandler(async (req, res) => {
    await QuizResult.deleteMany({ user: req.user._id });

    return res.status(200).json({
        success: true,
        message: "All quiz history cleared successfully"
    });
});
