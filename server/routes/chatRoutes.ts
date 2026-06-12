import { Router } from "express";
import { handleChatMessage } from "../controllers/chatController";

const router = Router();

// Endpoint: POST /api/chat
router.post("/", handleChatMessage);

export default router;
