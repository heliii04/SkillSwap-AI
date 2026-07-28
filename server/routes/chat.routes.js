import express from "express";
import {
    getChats,
    getMessages,
    sendMessage,
    findOrCreateChat,
} from "../controllers/chatController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getChats);
router.post("/", findOrCreateChat);
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);

export default router;
