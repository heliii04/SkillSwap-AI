import express from "express";

import {
    createSwapRoadmap,
    getAiStatus,
    getIcebreaker,
    getSwapRoadmap,
    semanticSearch,
    suggestSkillsFromBio,
    chatDiscussion,
    generatePersonalizedRoadmap,
    updateRoadmapProgress,
    getDailyPlan,
    generateQuiz
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

router.get("/roadmap/:requestId", getSwapRoadmap);
router.post("/roadmap/:requestId", aiLimiter, createSwapRoadmap);

router.post("/icebreaker", aiLimiter, getIcebreaker);

// Advanced AI Features
router.post("/chat", aiLimiter, chatDiscussion);
router.patch("/roadmap/:roadmapId/progress", aiLimiter, updateRoadmapProgress);
router.post("/roadmap/:roadmapId/daily-plan", aiLimiter, getDailyPlan);
router.post("/quiz", aiLimiter, generateQuiz);

export default router;
