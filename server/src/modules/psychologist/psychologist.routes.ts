import { Router } from "express";
import { psychologistController } from "./psychologist.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { upload } from "@/middlewares/upload.middleware";
import {
  updatePsychologistProfileSchema,
  getPsychologistsQuerySchema,
  uploadCredentialsSchema,
} from "./psychologist.validation";

const router = Router();

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
  upload.array("documents", 5), // multer first!
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
