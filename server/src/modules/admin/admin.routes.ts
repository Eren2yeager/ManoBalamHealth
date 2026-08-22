import { Router } from "express";
import { adminController } from "./admin.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  updatePsychologistStatusSchema,
  processRefundSchema,
  getPsychologistsSchema,
  getAppointmentsSchema,
  getUsersSchema,
  updateUserActivitySchema,
} from "./admin.validation";

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireRole("admin"));

// Psychologist management
router.get("/psychologists/pending", validate(getPsychologistsSchema, "query"), adminController.getPsychologists);
router.patch("/psychologists/:id/verify", validate(updatePsychologistStatusSchema), adminController.updatePsychologistStatus);
router.patch("/psychologists/:id/changes", validate(updatePsychologistStatusSchema), adminController.reviewPendingChanges);

// User directory and account safety controls
router.get("/users", validate(getUsersSchema, "query"), adminController.getUsers);
router.get("/users/:id", adminController.getUserDetail);
router.patch("/users/:id/activity", validate(updateUserActivitySchema), adminController.updateUserActivity);

// Appointment oversight
router.get("/appointments", validate(getAppointmentsSchema, "query"), adminController.getAppointments);

// Reports
router.get("/reports", adminController.getReportsSummary);

// Payment refunds — keyed by paymentId to match plan
router.patch("/payments/:id/refund", validate(processRefundSchema), adminController.processRefund);

export default router;
