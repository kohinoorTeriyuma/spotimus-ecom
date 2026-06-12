import { Router } from "express";
import { handleChatMessage } from "../controllers/chatController";
import { validateChatMessagePayload } from "../middleware/validationMiddleware";

const router = Router();

// Endpoint: POST /api/chat (secured with input validation mapping)
router.post("/", validateChatMessagePayload as any, handleChatMessage);

export default router;
