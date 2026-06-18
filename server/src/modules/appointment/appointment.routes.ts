import { Router } from "express";
import { appointmentController } from "./appointment.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createAppointmentSchema, getMyAppointmentsSchema, cancelAppointmentSchema } from "./appointment.validation";

const router = Router();

// Create appointment (patient only)
router.post(
  "/",
  requireAuth,
  requireRole("patient"),
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

// Get my appointments (any role)
router.get(
  "/me",
  requireAuth,
  validate(getMyAppointmentsSchema, "query"),
  appointmentController.getMyAppointments
);

// Get appointment by ID (any role, but must be participant or admin)
router.get(
  "/:id",
  requireAuth,
  appointmentController.getAppointmentById
);

// Cancel appointment (participant or admin)
router.patch(
  "/:id/cancel",
  requireAuth,
  validate(cancelAppointmentSchema),
  appointmentController.cancelAppointment
);

export default router;
