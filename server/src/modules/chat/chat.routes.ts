import { Router } from "express";
import { chatController } from "./chat.controller";
import { requireApprovalIfPsychologist, requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { chatAttachmentUpload } from "@/middlewares/upload.middleware";
import { getChatHistorySchema } from "./chat.validation";

const router = Router();

// Upload a chat attachment (participant only, session must not be ended)
router.post(
  "/:sessionId/attachment",
  requireAuth,
  requireApprovalIfPsychologist,
  chatAttachmentUpload.single("file"),
  chatController.uploadAttachment
);

// Get chat history for a session (require auth, must be participant or admin)
router.get(
  "/:sessionId/history",
  requireAuth,
  requireApprovalIfPsychologist,
  validate(getChatHistorySchema, "query"),
  chatController.getChatHistory
);

export default router;
