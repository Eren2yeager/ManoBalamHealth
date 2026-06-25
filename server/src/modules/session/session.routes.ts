import { Router } from "express";
import { sessionController } from "./session.controller";
import { requireApprovalIfPsychologist, requireApprovedPsychologist, requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { updateSessionNotesSchema } from "./session.validation";

const router = Router();

// Get session by appointment ID (require auth, must be participant or admin)
router.get(
  "/:appointmentId",
  requireAuth,
  requireApprovalIfPsychologist,
  sessionController.getSessionByAppointmentId
);

// Update session notes (psychologist only)
router.patch(
  "/:sessionId/notes",
  requireAuth,
  requireRole("psychologist"),
  requireApprovedPsychologist,
  validate(updateSessionNotesSchema),
  sessionController.updateSessionNotes
);

export default router;
