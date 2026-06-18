import { Router } from "express";
import { assessmentController } from "./assessment.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { submitAssessmentSchema } from "./assessment.validation";

const router = Router();

// Get assessment template (public)
router.get("/templates/:type", assessmentController.getTemplate);

// Submit assessment (authenticated)
router.post(
  "/submit",
  requireAuth,
  validate(submitAssessmentSchema),
  assessmentController.submitAssessment
);

// Get user's assessment history (authenticated)
router.get("/history", requireAuth, assessmentController.getUserHistory);

export default router;
