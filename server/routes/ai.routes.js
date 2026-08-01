import express from "express";

import {
    createSwapRoadmap,
    getAiStatus,
    getIcebreaker,
    getSwapRoadmap,
    semanticSearch,
    suggestSkillsFromBio,
} from "../controllers/aiController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.get("/status", getAiStatus);

router.use(requireAuth);

router.get("/search", aiLimiter, semanticSearch);

router.post("/suggest-skills", aiLimiter, suggestSkillsFromBio);

router.post("/icebreaker", aiLimiter, getIcebreaker);

router.get("/roadmap/:requestId", getSwapRoadmap);

router.post("/roadmap/:requestId", aiLimiter, createSwapRoadmap);

export default router;
