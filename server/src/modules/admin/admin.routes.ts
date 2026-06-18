import { Router } from "express";
import { adminController } from "./admin.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  updatePsychologistStatusSchema,
  processRefundSchema,
  getPsychologistsSchema,
  getAppointmentsSchema,
} from "./admin.validation";

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireRole("admin"));

router.get("/psychologists", validate(getPsychologistsSchema, "query"), adminController.getPsychologists);
router.patch("/psychologists/:id/status", validate(updatePsychologistStatusSchema), adminController.updatePsychologistStatus);
router.get("/appointments", validate(getAppointmentsSchema, "query"), adminController.getAppointments);
router.get("/reports/summary", adminController.getReportsSummary);
router.post("/appointments/:appointmentId/refund", validate(processRefundSchema), adminController.processRefund);

export default router;
