import { Router } from "express";
import { psychologistController } from "./psychologist.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { credentialUpload } from "@/middlewares/upload.middleware";
import {
  updatePsychologistProfileSchema,
  getPsychologistsQuerySchema,
  uploadCredentialsSchema,
} from "./psychologist.validation";

const router = Router();

router.get(
  "/me/onboarding",
  requireAuth,
  requireRole("psychologist"),
  psychologistController.getMyOnboarding,
);

router.post(
  "/me/submit",
  requireAuth,
  requireRole("psychologist"),
  psychologistController.submitForReview,
);

router.get(
  "/",
  validate(getPsychologistsQuerySchema, "query"),
  psychologistController.getPsychologists,
);

router.get("/:id", psychologistController.getPsychologistById);

router.post(
  "/credentials",
  requireAuth,
  requireRole("psychologist"),
  credentialUpload.array("documents", 5),
  validate(uploadCredentialsSchema), // then validate!
  psychologistController.uploadCredentials,
);

router.patch(
  "/me/profile",
  requireAuth,
  requireRole("psychologist"),
  validate(updatePsychologistProfileSchema),
  psychologistController.updateMyProfile,
);

export default router;
