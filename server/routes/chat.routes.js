import express from "express";
import {
    getChats,
    getMessages,
    sendMessage,
    findOrCreateChat,
    toggleBlockChat,
    clearChatMessages,
    deleteChatRoom,
} from "../controllers/chatController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getChats);
router.post("/", findOrCreateChat);
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);

router.patch("/:chatId/block", toggleBlockChat);
router.delete("/:chatId/clear", clearChatMessages);
router.delete("/:chatId", deleteChatRoom);

export default router;
