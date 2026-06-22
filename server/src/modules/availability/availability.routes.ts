import { Router } from "express";
import { availabilityController } from "./availability.controller";
import { requireActiveUser, requireApprovedPsychologist, requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { setRulesSchema, getSlotsSchema } from "./availability.validation";

const router = Router();

router.patch(
  "/me/rules",
  requireAuth,
  requireActiveUser,
  requireRole("psychologist"),
  requireApprovedPsychologist,
  validate(setRulesSchema),
  availabilityController.setRules
);

router.get(
  "/:psychologistId/slots",
  validate(getSlotsSchema, "query"),
  availabilityController.getSlots
);

router.patch(
  "/slots/:slotId/block",
  requireAuth,
  requireActiveUser,
  requireRole("psychologist"),
  requireApprovedPsychologist,
  availabilityController.blockSlot
);

export default router;
