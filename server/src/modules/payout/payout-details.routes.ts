import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { payoutDetailsController } from "./payout-details.controller";
import {
  createPayoutDetailsSchema,
  updatePayoutDetailsSchema,
  reviewPayoutDetailsSchema,
} from "./payout.validation";

const router = Router();

// All payout-details routes require authentication
router.use(requireAuth);

// Psychologist routes
router.post(
  "/",
  requireRole("psychologist"),
  validate(createPayoutDetailsSchema, "body"),
  payoutDetailsController.createPayoutDetails,
);

router.put(
  "/",
  requireRole("psychologist"),
  validate(updatePayoutDetailsSchema, "body"),
  payoutDetailsController.updatePayoutDetails,
);

router.get(
  "/my",
  requireRole("psychologist"),
  payoutDetailsController.getMyPayoutDetails,
);

// Admin-only routes
router.get(
  "/psychologist/:psychologistId",
  requireRole("admin"),
  payoutDetailsController.getPayoutDetailsForAdmin,
);

router.put(
  "/psychologist/:psychologistId/review",
  requireRole("admin"),
  validate(reviewPayoutDetailsSchema),
  payoutDetailsController.reviewPayoutDetails,
);

export default router;
