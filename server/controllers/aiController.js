import mongoose from "mongoose";
import Skill, { resolveCanonicalSkill } from "../models/Skill.js";
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

const GREETING_PATTERNS = /^(hello|hi|hey|hy|hola|namaste|good\s*morning|good\s*afternoon|good\s*evening|gm|gn)\b[\s!?.]*$/i;

export const isGreetingQuery = (text) => {
    if (!text || typeof text !== "string") return false;
    return GREETING_PATTERNS.test(text.trim());
};

export const NON_SKILL_PATTERNS = [
    /\b(slap|punch|hit|kick|kill|murder|steal|rob|hack|abuse|fight|attack|harm|weapon|gun|knife|drug|smoke|beer|alcohol|wine|beat|insult|scold|torture|shoot|destroy|bully|threat|sex|sexual|sexuality)\b/i,
    /\b(sleep|eating|eat|drink|buying|buy|selling|sell|walk|running|bathroom|wash|shower|clean house|brushing|toilet)\b/i,
    /\b(recipe|maggi|food|cooking dish|pasta|biryani|cake|tea|coffee|pizza|burger|samosa|momos|icecream|snack|breakfast|lunch|dinner)\b/i,
    /\b(movie|film|actor|actress|gossip|song|joke|comedy|prank|meme|cinema|trailer|pubg|freefire|ludo|bgmi|fortnite)\b/i,
    /\b(politics|election|prime minister|president|government|war|news|modi|trump|biden|weather|temperature|rain|climate)\b/i,
    /\b(dating|gf|bf|girlfriend|boyfriend|love|romance|flirt|breakup|kiss|hug|marry|marriage|relationship)\b/i,
    /\b(score|ipl|cricket match|football match|match score|match today|fifa)\b/i,
    /\b(who is|tell me a story|sing a song|what is your name|whats ur name|whats your name|what's your name|who are you|who r u|how old are you|where do you live|who made you|your name|ur name|what is ur name|how are you|how r u|how are u|hru|kaise ho|kese ho|what are you doing|wbu|kya kar rahe ho|kya kr rhe ho)\b/i
];

const SKILL_KEYWORDS_REGEX = /\b(skill|skills|learn|learning|teach|teaching|swap|swaps|swaprequest|mentor|mentorship|platform|course|roadmap|react|javascript|python|java|c\+\+|node|express|html|css|figma|design|music|guitar|piano|fitness|yoga|language|english|hindi|spanish|french|code|coding|development|database|mongodb|sql|ai|machine learning|web|app|backend|frontend|fullstack|devops|git|github|api)\b/i;

export const checkIsNonSkillQuery = (text) => {
    if (!text || typeof text !== "string") return false;
    const clean = text.trim();
    if (!clean) return false;

    if (isGreetingQuery(clean)) {
        return false;
    }

    if (SKILL_KEYWORDS_REGEX.test(clean)) {
        return false;
    }

    for (const pattern of NON_SKILL_PATTERNS) {
        if (pattern.test(clean)) {
            return true;
        }
    }

    return false;
};

export const findTopSkillMentors = async (queryText) => {
    if (!queryText || typeof queryText !== "string") return [];

    const canonical = resolveCanonicalSkill(queryText);
    const searchTerms = [queryText];
    if (canonical) {
        searchTerms.push(canonical.title);
        searchTerms.push(canonical.normalizedTitle);
    }

    const words = searchTerms
        .join(" ")
        .toLowerCase()
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
                    "tell",
                    "about",
                    "explain",
                ].includes(w)
        );

    if (words.length === 0) return [];

    const regexes = words.map((w) => new RegExp(w, "i"));
    const skills = await Skill.find({
        type: "teach",
        isActive: true,
        $or: [
            { title: { $in: regexes } },
            { tags: { $in: regexes } },
            { category: { $in: regexes } },
        ],
    })
        .populate("owner", "name headline avatar location")
        .limit(10)
        .lean();

    const mentorMap = new Map();
    for (const s of skills) {
        if (s.owner && s.owner._id && !mentorMap.has(s.owner._id.toString())) {
            mentorMap.set(s.owner._id.toString(), {
                name: s.owner.name,
                headline: s.owner.headline || `Teaches ${s.title}`,
                skillTitle: s.title,
            });
        }
        if (mentorMap.size >= 3) break;
    }

    return Array.from(mentorMap.values());
};

export const formatMentorSuggestions = (mentors) => {
    if (!mentors || mentors.length === 0) return "";

    const lines = mentors.map(
        (m) => `• ${m.name}${m.headline ? ` (${m.headline})` : ` (Teaches ${m.skillTitle})`}`
    );
    return `💡 Top mentors on SkillSwap for this skill:\n` + lines.join("\n");
};

export const chatDiscussion = asyncHandler(async (req, res) => {
    const { message, history, sessionId } = req.body;
    const activeSessionId = sessionId || Date.now().toString();

    if (isGreetingQuery(message)) {
        const welcomeResponse = "Hey there! 👋 Welcome to SkillSwap AI! I'm your personal learning companion here. Whether you want to explore a new skill, get a step-by-step learning roadmap, take a quiz, or connect with top mentors — I've got you covered! 😊\n\nSo, what skill are you curious about today?";

        if (req.user?._id) {
            const titleSnippet = message.slice(0, 35) + (message.length > 35 ? "..." : "");
            const userMsg = { sender: "user", text: message, timestamp: new Date() };
            const aiMsg = { sender: "ai", text: welcomeResponse, timestamp: new Date() };

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
                reply: welcomeResponse,
                sessionId: activeSessionId,
            },
        });
    }

    if (checkIsNonSkillQuery(message)) {
        const sorryResponse = "Oops, that's a bit outside my zone! 😊 I'm specialized in helping you learn, teach, and exchange skills on SkillSwap. Ask me about any skill like Python, UI/UX Design, React, Data Science, and more — I'd love to help you grow!";

        if (req.user?._id) {
            const titleSnippet = message.slice(0, 35) + (message.length > 35 ? "..." : "");
            const userMsg = { sender: "user", text: message, timestamp: new Date() };
            const aiMsg = { sender: "ai", text: sorryResponse, timestamp: new Date() };

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
                reply: sorryResponse,
                sessionId: activeSessionId,
            },
        });
    }

    let systemContext =
        `You are a warm, friendly, and expert learning companion on SkillSwap — a platform for learning and teaching skills.

Your personality:
- You are encouraging, patient, and supportive like a great mentor
- You use simple, clear, and easy-to-understand language
- You make every user feel comfortable, confident, and satisfied with your response
- You never make the user feel awkward, embarrassed, or nervous
- Use emojis occasionally (👋, 🚀, 💡, 📚, ✅) to make responses feel friendly and human
- Format your responses clearly using bullet points or short paragraphs for readability

Language rule: Default to English. If the user writes in Hindi or Gujarati, respond in that language naturally.

Strict limitations:
- ONLY answer questions about skills, learning, teaching, or the SkillSwap platform
- If unrelated (jokes, weather, recipes, personal chit-chat), gently redirect with:
  "Oops, that's a bit outside my zone! 😊 I specialize in helping you learn and grow on SkillSwap. Ask me about any skill and I'll guide you!"

Spelling correction: Always silently auto-correct skill typos (e.g., 'Pyton' → 'Python', 'reac' → 'React', 'Javscript' → 'JavaScript') and use the correct name in your reply.

For skill explanations:
- What the skill is and why it's valuable
- Key topics/concepts a learner should focus on
- Real-world use cases and opportunities
- An encouraging closing line motivating the user to start learning

Never echo the user's question back. Jump directly into a helpful, clear, friendly answer.

STRICT LANGUAGE MIRRORING RULE: You MUST always respond in the EXACT SAME language the user writes in.
- If the user writes in English → respond ONLY in English
- If the user writes in Hindi (Devanagari or Roman) → respond in Hindi/Hinglish
- If the user writes in Gujarati → respond in Gujarati
- If the user writes in mixed Hinglish → respond in Hinglish
- NEVER switch languages on your own. Always match the user's language.

SkillSwap Learning Path Rule: When the user asks HOW to learn a skill, WHERE to start, "kaise sikhu", "steps to learn", or "kahan se sikhu" — ALWAYS guide them to use SkillSwap's 3 core features:
1. 📍 Roadmap tab — generate a personalized week-by-week learning plan
2. 🧠 Quiz tab — practice with MCQs, Q&A, and Coding questions
3. 🤝 Swap Request — find mentors on SkillSwap and learn 1-on-1 through skill exchange
Respond in the SAME language the user used. Mention all 3 features warmly and tell them to start today!`;

    const topMentors = await findTopSkillMentors(message);
    if (topMentors.length > 0) {
        const mentorSuggestions = formatMentorSuggestions(topMentors);
        systemContext += `\n\nCRITICAL INSTRUCTION: At the end of your response, ALWAYS include this exact mentor list:\n${mentorSuggestions}`;
    }

    // Convert history to prompt string for simplicity, or just pass message if no history
    let prompt = message;
    if (history && history.length > 0) {
        const historyText = history
            .map((h) => `${h.role || h.sender}: ${h.content || h.text}`)
            .join("\n");
        prompt = historyText + `\nuser: ${message}`;
        systemContext += " IMPORTANT: This is a multi-turn conversation. Use the conversation history above to understand context and correctly answer follow-up questions (like 'what are the steps of it?', 'tell me more', 'explain further') by referring to what was previously discussed. Never treat vague follow-up questions as new unrelated topics.";
    } else {
        systemContext +=
            " When the user asks about a skill or topic, answer their question directly and DO NOT include any greeting banner.";
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

        if (isGreetingQuery(message)) {
            const welcomeResponse = "Hey there! 👋 Welcome to SkillSwap AI! I'm your personal learning companion here. Whether you want to explore a new skill, get a step-by-step learning roadmap, take a quiz, or connect with top mentors — I've got you covered! 😊\n\nSo, what skill are you curious about today?";
            const words = welcomeResponse.split(" ");
            for (const word of words) {
                res.write(`data: ${JSON.stringify({ chunk: word + " ", sessionId: activeSessionId })}\n\n`);
                await new Promise((r) => setTimeout(r, 15));
            }
            res.write("data: [DONE]\n\n");
            res.end();

            if (req.user?._id) {
                const titleSnippet = message.slice(0, 35) + (message.length > 35 ? "..." : "");
                const userMsg = { sender: "user", text: message, timestamp: new Date() };
                const aiMsg = { sender: "ai", text: welcomeResponse, timestamp: new Date() };

                await AIChatHistory.findOneAndUpdate(
                    { user: req.user._id, sessionId: activeSessionId },
                    {
                        $setOnInsert: { title: titleSnippet },
                        $push: { messages: { $each: [userMsg, aiMsg] } },
                    },
                    { upsert: true, new: true }
                ).catch((err) => console.error("Error saving AI stream history to DB:", err.message));
            }
            return;
        }

        if (checkIsNonSkillQuery(message)) {
            const sorryResponse = "Oops, that's a bit outside my zone! 😊 I'm specialized in helping you learn, teach, and exchange skills on SkillSwap. Ask me about any skill like Python, UI/UX Design, React, Data Science, and more — I'd love to help you grow!";
            const words = sorryResponse.split(" ");
            for (const word of words) {
                res.write(`data: ${JSON.stringify({ chunk: word + " ", sessionId: activeSessionId })}\n\n`);
                await new Promise((r) => setTimeout(r, 15));
            }
            res.write("data: [DONE]\n\n");
            res.end();

            if (req.user?._id) {
                const titleSnippet = message.slice(0, 35) + (message.length > 35 ? "..." : "");
                const userMsg = { sender: "user", text: message, timestamp: new Date() };
                const aiMsg = { sender: "ai", text: sorryResponse, timestamp: new Date() };

                await AIChatHistory.findOneAndUpdate(
                    { user: req.user._id, sessionId: activeSessionId },
                    {
                        $setOnInsert: { title: titleSnippet },
                        $push: { messages: { $each: [userMsg, aiMsg] } },
                    },
                    { upsert: true, new: true }
                ).catch((err) => console.error("Error saving AI stream history to DB:", err.message));
            }
            return;
        }

        let systemContext =
            `You are a warm, friendly, and expert learning companion on SkillSwap — a platform for learning and teaching skills.

Your personality:
- You are encouraging, patient, and supportive like a great mentor
- You use simple, clear, and easy-to-understand language
- You make every user feel comfortable, confident, and satisfied with your response
- You never make the user feel awkward, embarrassed, or nervous
- Use emojis occasionally (👋, 🚀, 💡, 📚, ✅) to make responses feel friendly and human
- Format your responses clearly using bullet points or short paragraphs for readability

Language rule: Default to English. If the user writes in Hindi or Gujarati, respond in that language naturally.

STRICT LANGUAGE MIRRORING RULE: You MUST always respond in the EXACT SAME language the user writes in.
- If the user writes in English → respond ONLY in English
- If the user writes in Hindi (Devanagari or Roman) → respond in Hindi/Hinglish
- If the user writes in Gujarati → respond in Gujarati
- If the user writes in mixed Hinglish → respond in Hinglish
- NEVER switch languages on your own. Always match the user's language.

Strict limitations:
- ONLY answer questions about skills, learning, teaching, or the SkillSwap platform
- If unrelated (jokes, weather, recipes, personal chit-chat), gently redirect with:
  "Oops, that's a bit outside my zone! 😊 I specialize in helping you learn and grow on SkillSwap. Ask me about any skill and I'll guide you!"

Spelling correction: Always silently auto-correct skill typos (e.g., 'Pyton' → 'Python', 'reac' → 'React', 'Javscript' → 'JavaScript') and use the correct name.

For skill explanations:
- What the skill is and why it's valuable
- Key topics/concepts a learner should focus on
- Real-world use cases and opportunities
- An encouraging closing line motivating the user to start

Never echo the user's question back. Jump directly into a helpful, clear, friendly answer.

SkillSwap Learning Path Rule: When the user asks HOW to learn a skill, WHERE to start, "kaise sikhu", "steps to learn", or "kahan se sikhu" — ALWAYS guide them to use SkillSwap's 3 core features:
1. 📍 Roadmap tab — generate a personalized week-by-week learning plan
2. 🧠 Quiz tab — practice with MCQs, Q&A, and Coding questions
3. 🤝 Swap Request — find mentors on SkillSwap and learn 1-on-1 through skill exchange
Respond in the SAME language the user used. Mention all 3 features warmly and tell them to start today!`;

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

        const topMentors = await findTopSkillMentors(message);
        if (topMentors.length > 0) {
            const mentorSuggestions = formatMentorSuggestions(topMentors);
            systemContext += `\n\nCRITICAL INSTRUCTION: At the end of your response, ALWAYS include this exact mentor list:\n${mentorSuggestions}`;
        }

        let prompt = message;
        if (history && history.length > 0) {
            const historyText = history
                .map((h) => `${h.role || h.sender}: ${h.content || h.text}`)
                .join("\n");
            prompt = historyText + `\nuser: ${message}`;
            systemContext += " IMPORTANT: This is a multi-turn conversation. Use the conversation history above to understand context and correctly answer follow-up questions (like 'what are the steps of it?', 'tell me more', 'explain further') by referring to what was previously discussed. Never treat vague follow-up questions as new unrelated topics.";
        } else {
            systemContext +=
                " When the user asks about a skill or topic, answer their question directly and DO NOT include any greeting banner.";
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


export const isEducationalSkillTopic = async (topic) => {
    if (!topic || typeof topic !== "string") return false;
    const clean = topic.trim();
    if (clean.length < 2) return false;

    // 1. Fast regex check for harmful, aggressive, violent, or non-skill phrases
    for (const pattern of NON_SKILL_PATTERNS) {
        if (pattern.test(clean)) return false;
    }

    // 2. Canonical skill check
    const canonical = resolveCanonicalSkill(clean);
    if (canonical) return true;

    // 3. AI Guardrail check for unrecognized / ambiguous phrases
    try {
        const prompt = `Topic: "${clean}"\nIs this a legitimate educational, technical, creative, business, language, music, fitness, photography, or professional skill? Or is it a non-skill phrase, violent/harmful action, casual chat, recipe, or random sentence?`;
        const systemInstruction = "You are a strict skill validator. Return JSON strictly with key 'isValidSkill' (boolean true or false). Any non-skill, violent action, daily chore, recipe, gossip, or joke MUST return false.";
        const schema = {
            type: "object",
            properties: { isValidSkill: { type: "boolean" } },
            required: ["isValidSkill"]
        };
        const res = await generateStructuredContent(prompt, systemInstruction, schema);
        if (res && typeof res.isValidSkill === "boolean") {
            return res.isValidSkill;
        }
    } catch {
        // Fallback for network issues
    }

    return true;
};

export const generatePersonalizedRoadmap = asyncHandler(async (req, res) => {
    const { skill, currentLevel, targetLevel, availableTime, duration, learningStyle } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
        throw new ApiError(401, "Authentication required to generate roadmap.");
    }

    if (!skill || !skill.trim()) {
        throw new ApiError(400, "Failed to generate roadmap");
    }

    const isValidSkill = await isEducationalSkillTopic(skill);
    if (!isValidSkill) {
        throw new ApiError(400, "Failed to generate roadmap");
    }

    const prompt = `Generate a personalized learning roadmap for the following:
Skill: ${skill}
Current Level: ${currentLevel}
Target Level: ${targetLevel}
Available Time: ${availableTime}
Duration: ${duration}
Learning Style: ${learningStyle}
Create a structured week-by-week plan.`;

    const systemInstruction = "You are an expert tutor. Generate a highly structured roadmap in JSON format matching the schema exactly.";

    let roadmapData;
    try {
        roadmapData = await generateStructuredContent(prompt, systemInstruction, roadmapSchema);
        if (!roadmapData || !Array.isArray(roadmapData.weeks) || roadmapData.weeks.length === 0) {
            throw new Error("Invalid roadmap structure");
        }
        // Sanitize LLM response to match schema strictly
        roadmapData.weeks = roadmapData.weeks.map((w, idx) => ({
            weekNumber: w.weekNumber || idx + 1,
            focus: w.focus || `Week ${idx + 1} Focus`,
            tasks: Array.isArray(w.tasks) ? w.tasks.map(t => ({
                title: typeof t === 'string' ? t : (t.title || 'Task'),
                description: typeof t === 'object' ? (t.description || '') : '',
                isCompleted: false
            })) : []
        }));
    } catch (err) {
        console.warn("AI roadmap generation failed, using structured template fallback:", err.message);
        roadmapData = {
            weeks: [
                {
                    weekNumber: 1,
                    focus: `Foundational Knowledge & Environment Setup for ${skill}`,
                    tasks: [
                        { title: `Introduction to ${skill}`, description: `Understand core principles, syntax, and foundational concepts of ${skill}.`, isCompleted: false },
                        { title: "Environment & Tooling", description: `Install required compilers, extensions, dependencies, and set up your workspace.`, isCompleted: false },
                        { title: "First Hands-on Project", description: `Build a basic 'Hello World' and run fundamental scripts in ${skill}.`, isCompleted: false }
                    ]
                },
                {
                    weekNumber: 2,
                    focus: `Core Syntax, Functions & Control Flow in ${skill}`,
                    tasks: [
                        { title: "Control Flow & Logic", description: "Master conditionals, loops, functions, and standard error handling.", isCompleted: false },
                        { title: "Data Structures & State", description: "Learn variables, arrays, objects, maps, and state representation.", isCompleted: false },
                        { title: "Practice Challenge", description: "Implement 3 small practical exercises solving real-world micro-problems.", isCompleted: false }
                    ]
                },
                {
                    weekNumber: 3,
                    focus: `Intermediate Patterns & Architecture in ${skill}`,
                    tasks: [
                        { title: "Modular Architecture", description: "Break code into reusable modules, services, components, and clean folders.", isCompleted: false },
                        { title: "Asynchronous Operations & APIs", description: "Understand async/await, promises, HTTP requests, or event listeners.", isCompleted: false },
                        { title: "Mini Project", description: "Build a functional mini application incorporating all learned patterns.", isCompleted: false }
                    ]
                },
                {
                    weekNumber: 4,
                    focus: `Advanced Topics, Optimization & Capstone Project in ${skill}`,
                    tasks: [
                        { title: "Performance Optimization", description: "Analyze bottlenecks, refactor code, and follow industry best practices.", isCompleted: false },
                        { title: "Testing & Debugging", description: "Write unit/integration tests and debug edge cases efficiently.", isCompleted: false },
                        { title: "Full Capstone Project", description: "Deploy a complete portfolio-ready project demonstrating ${skill} mastery.", isCompleted: false }
                    ]
                }
            ]
        };
    }

    // Save to DB safely
    const newRoadmap = await LearningRoadmap.create({
        user: userId,
        skill,
        currentLevel: currentLevel || "Beginner",
        targetLevel: targetLevel || "Job-ready",
        availableTime: availableTime || "1 hour daily",
        duration: duration || "4 weeks",
        learningStyle: learningStyle || "Project based",
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

export const getUserRoadmaps = asyncHandler(async (req, res) => {
    const roadmaps = await LearningRoadmap.find({ user: req.user._id })
        .sort({ updatedAt: -1 })
        .lean();

    const formatted = roadmaps.map((r) => ({
        id: r._id.toString(),
        roadmap: r,
        updatedAt: r.updatedAt,
    }));

    return res.status(200).json({
        success: true,
        data: {
            sessions: formatted,
        },
    });
});

export const deleteUserRoadmap = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await LearningRoadmap.deleteOne({
        _id: id,
        user: req.user._id,
    });

    return res.status(200).json({
        success: true,
        message: "Roadmap deleted successfully",
    });
});

export const clearAllUserRoadmaps = asyncHandler(async (req, res) => {
    await LearningRoadmap.deleteMany({
        user: req.user._id,
    });

    return res.status(200).json({
        success: true,
        message: "All roadmaps cleared successfully",
    });
});

export const generateQuiz = asyncHandler(async (req, res) => {
    const { topic, numQuestions = 10 } = req.body;

    if (!topic || !topic.trim()) {
        throw new ApiError(400, "Failed to generate quiz");
    }

    const isValidSkill = await isEducationalSkillTopic(topic);
    if (!isValidSkill) {
        throw new ApiError(400, "Failed to generate quiz");
    }

    const targetNum = parseInt(numQuestions, 10) || 10;
    const prompt = `Generate a ${targetNum}-question quiz on topic: ${topic}. IMPORTANT: The quiz MUST contain EXACTLY ${targetNum} questions with a rich mix:
- 4 MCQs (Multiple Choice Questions with type "MCQ" and exactly 4 options)
- 3 Conceptual Q/A questions (type "Q/A" with an empty array [] for options)
- 3 Practical Coding/Problem-Solving questions (type "Coding" with starter code or problem statement and an empty array [] for options)
Ensure the questions are highly varied, educational, and accurately test deep knowledge of ${topic}. (Random Seed: ${Math.random().toString(36).substring(7)} - ${Date.now()}).`;
    const systemInstruction = "You are an expert examiner. Return the quiz in the specified JSON format.";

    let quizData;
    try {
        quizData = await generateStructuredContent(prompt, systemInstruction, quizSchema);
        if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("Invalid quiz structure returned from AI model");
        }
    } catch (err) {
        console.warn("AI quiz generation failed, using structured 10-question template fallback:", err.message);
        quizData = getQuizFallback(prompt);
    }

    return res.status(200).json({
        success: true,
        data: quizData
    });
});

export const saveQuizResult = asyncHandler(async (req, res) => {
    const { id, topic, score, totalQuestions, quizData, userAnswers } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }

    if (!topic || score === undefined || !totalQuestions) {
        throw new ApiError(400, "Topic, score, and totalQuestions are required.");
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    let result;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
        result = await QuizResult.findOneAndUpdate(
            { _id: id, user: userId },
            {
                topic,
                score,
                totalQuestions,
                percentage,
                quizData: quizData || [],
                userAnswers: userAnswers || {}
            },
            { new: true }
        );
    }

    if (!result) {
        result = await QuizResult.create({
            user: userId,
            topic,
            score,
            totalQuestions,
            percentage,
            quizData: quizData || [],
            userAnswers: userAnswers || {}
        });
    }

    return res.status(200).json({
        success: true,
        message: "Quiz result saved successfully",
        data: { quizResult: result }
    });
});

export const getUserQuizResults = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }

    const results = await QuizResult.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: { quizResults: results }
    });
});

export const deleteQuizResult = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }

    await QuizResult.deleteOne({ _id: id, user: userId });

    return res.status(200).json({
        success: true,
        message: "Quiz result deleted successfully"
    });
});

export const clearAllQuizResults = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
        throw new ApiError(401, "Authentication required.");
    }

    await QuizResult.deleteMany({ user: userId });

    return res.status(200).json({
        success: true,
        message: "All quiz history cleared successfully"
    });
});
