import express from "express";
import multer from "multer";
import {
    getChats,
    getMessages,
    sendMessage,
    findOrCreateChat,
    toggleBlockChat,
    clearChatMessages,
    deleteChatRoom,
    deleteSelectedMessages,
    markChatAsRead,
    uploadChatDocument,
} from "../controllers/chatController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { messageLimiter } from "../middleware/rateLimit.middleware.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
});

const router = express.Router();

router.use(requireAuth);

router.get("/", getChats);
router.post("/", findOrCreateChat);
router.post("/upload-document", upload.single("file"), uploadChatDocument);
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", messageLimiter, sendMessage);
router.post("/:chatId/messages/delete", deleteSelectedMessages);
router.post("/:chatId/read", markChatAsRead);

router.patch("/:chatId/block", toggleBlockChat);
router.delete("/:chatId/clear", clearChatMessages);
router.delete("/:chatId", deleteChatRoom);

export default router;
