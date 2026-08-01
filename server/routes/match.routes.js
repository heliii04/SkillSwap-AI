import express from "express";

import { getMyMatches } from "../controllers/matchController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getMyMatches);

export default router;
