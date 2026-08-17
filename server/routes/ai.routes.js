import express from "express";

import {
    createSwapRoadmap,
    getAiStatus,
    getIcebreaker,
    getSwapRoadmap,
    semanticSearch,
    suggestSkillsFromBio,
    chatDiscussion,
    streamChatDiscussion,
    getAiChatSessions,
    deleteAiChatSession,
    clearAllAiChatHistory,
    generatePersonalizedRoadmap,
    getUserRoadmaps,
    deleteUserRoadmap,
    clearAllUserRoadmaps,
    updateRoadmapProgress,
    getDailyPlan,
    generateQuiz,
    saveQuizResult,
    getUserQuizResults,
    deleteQuizResult,
    clearAllQuizResults
} from "../controllers/aiController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.get("/status", getAiStatus);

router.use(requireAuth);

router.get("/search", aiLimiter, semanticSearch);

router.post("/suggest-skills", aiLimiter, suggestSkillsFromBio);

// Fix: Put specific roadmap routes before parameter routes
router.post("/roadmap/generate", aiLimiter, generatePersonalizedRoadmap);
router.get("/roadmap/history", getUserRoadmaps);
router.delete("/roadmap/history/:id", deleteUserRoadmap);
router.delete("/roadmap/history", clearAllUserRoadmaps);

router.get("/roadmap/:requestId", getSwapRoadmap);
router.post("/roadmap/:requestId", aiLimiter, createSwapRoadmap);

router.post("/icebreaker", aiLimiter, getIcebreaker);

// Advanced AI Features & History
router.get("/chat/sessions", getAiChatSessions);
router.delete("/chat/sessions/:sessionId", deleteAiChatSession);
router.delete("/chat/sessions", clearAllAiChatHistory);
router.post("/chat", aiLimiter, chatDiscussion);
router.post("/chat/stream", aiLimiter, streamChatDiscussion);
router.patch("/roadmap/:roadmapId/progress", aiLimiter, updateRoadmapProgress);
router.post("/roadmap/:roadmapId/daily-plan", aiLimiter, getDailyPlan);
router.post("/quiz", aiLimiter, generateQuiz);

// Quiz Results & History
router.post("/quiz/save", aiLimiter, saveQuizResult);
router.get("/quiz/history", getUserQuizResults);
router.delete("/quiz/history/:id", deleteQuizResult);
router.delete("/quiz/history", clearAllQuizResults);

export default router;
