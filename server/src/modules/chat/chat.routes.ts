import { Router } from "express";
import { chatController } from "./chat.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { getChatHistorySchema } from "./chat.validation";

const router = Router();

// Get chat history for a session (require auth, must be participant or admin)
router.get(
  "/:sessionId/history",
  requireAuth,
  validate(getChatHistorySchema, "query"),
  chatController.getChatHistory
);

export default router;
