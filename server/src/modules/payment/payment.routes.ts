import { Router } from "express";
import express from "express";
import { paymentController } from "./payment.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createPaymentOrderSchema, verifyPaymentSchema } from "./payment.validation";

const router = Router();

// Create payment order (patient only)
router.post(
  "/create-order",
  requireAuth,
  requireRole("patient"),
  validate(createPaymentOrderSchema),
  paymentController.createPaymentOrder
);

// Verify payment (patient only)
router.post(
  "/verify",
  requireAuth,
  requireRole("patient"),
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

// Razorpay webhook (no auth, uses raw body parser)
router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }), // Raw body parser
  paymentController.handleWebhook
);

export default router;
