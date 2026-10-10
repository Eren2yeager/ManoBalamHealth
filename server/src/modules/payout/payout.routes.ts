import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { payoutController } from "./payout.controller";
import {
  getPayoutsQuerySchema,
  createPayoutSchema,
  completeManualPayoutSchema,
  updatePayoutSchema,
} from "./payout.validation";

const router = Router();

// All payout routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole("admin"));

// Payout readiness endpoint
router.get(
  "/readiness",
  payoutController.getPayoutReadiness,
);

// Payout management endpoints
router.post(
  "/",
  validate(createPayoutSchema, "body"),
  payoutController.createPayout,
);

router.get(
  "/",
  validate(getPayoutsQuerySchema, "query"),
  payoutController.getPayouts,
);

// Raw payout instructions are deliberately available only through this
// explicit admin action; payout lists and ordinary detail views remain masked.
router.get(
  "/:id/manual-instructions",
  payoutController.getManualPayoutInstructions,
);

router.post(
  "/:id/manual-completion",
  validate(completeManualPayoutSchema, "body"),
  payoutController.completeManualPayout,
);

router.get(
  "/:id",
  payoutController.getPayoutById,
);

router.put(
  "/:id",
  validate(updatePayoutSchema, "body"),
  payoutController.updatePayout,
);

export default router;
