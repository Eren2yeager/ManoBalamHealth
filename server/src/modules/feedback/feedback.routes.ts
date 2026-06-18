import { Router } from "express";
import { feedbackController } from "./feedback.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createFeedbackSchema, getFeedbackListSchema } from "./feedback.validation";
import { Roles } from "@/constants/roles.constant";

const router = Router();

// Create feedback (patient only)
router.post(
  "/",
  requireAuth,
  requireRole(Roles.PATIENT),
  validate(createFeedbackSchema),
  feedbackController.createFeedback
);

// Get psychologist's feedback (public or any role)
router.get(
  "/psychologist/:psychologistId",
  validate(getFeedbackListSchema, "query"),
  feedbackController.getPsychologistFeedback
);

export default router;
