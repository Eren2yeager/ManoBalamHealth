import { Router } from "express";
import { psychologistController } from "./psychologist.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { credentialUpload } from "@/middlewares/upload.middleware";
import {
  updatePsychologistProfileSchema,
  getPsychologistsQuerySchema,
  uploadCredentialsSchema,
  setPsychologistFeeSchema,
  bulkSetPsychologistFeeSchema,
} from "./psychologist.validation";

const router = Router();

router.get("/meta", psychologistController.getMeta);

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

router.delete(
  "/me/credentials/:credentialId",
  requireAuth,
  requireRole("psychologist"),
  psychologistController.deleteCredential,
);

router.patch(
  "/me/profile",
  requireAuth,
  requireRole("psychologist"),
  validate(updatePsychologistProfileSchema),
  psychologistController.updateMyProfile,
);

// Admin-only fee management routes
router.put(
  "/fees/bulk",
  requireAuth,
  requireRole("admin"),
  validate(bulkSetPsychologistFeeSchema),
  psychologistController.bulkSetPsychologistFee,
);

router.put(
  "/:id/fee",
  requireAuth,
  requireRole("admin"),
  validate(setPsychologistFeeSchema),
  psychologistController.setPsychologistFee,
);

router.get(
  "/:id/fee-history",
  requireAuth,
  requireRole("admin"),
  psychologistController.getFeeHistory,
);

export default router;
