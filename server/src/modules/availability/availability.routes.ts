import { Router } from "express";
import { availabilityController } from "./availability.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { setRulesSchema, getSlotsSchema } from "./availability.validation";

const router = Router();

router.patch(
  "/me/rules",
  requireAuth,
  requireRole("psychologist"),
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
  requireRole("psychologist"),
  availabilityController.blockSlot
);

export default router;
