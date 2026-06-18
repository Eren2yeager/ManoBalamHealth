import { Router } from "express";
import authRoutes from "@/modules/auth/auth.routes";
import userRoutes from "@/modules/user/user.routes";
import psychologistRoutes from "@/modules/psychologist/psychologist.routes";
import availabilityRoutes from "@/modules/availability/availability.routes";
import appointmentRoutes from "@/modules/appointment/appointment.routes";
import paymentRoutes from "@/modules/payment/payment.routes";
import sessionRoutes from "@/modules/session/session.routes";
import chatRoutes from "@/modules/chat/chat.routes";
import feedbackRoutes from "@/modules/feedback/feedback.routes";
import assessmentRoutes from "@/modules/assessment/assessment.routes";
import crisisRoutes from "@/modules/crisis/crisis.routes";
import adminRoutes from "@/modules/admin/admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/psychologists", psychologistRoutes);
router.use("/availability", availabilityRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/sessions", sessionRoutes);
router.use("/chat", chatRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/assessments", assessmentRoutes);
router.use("/crisis", crisisRoutes);
router.use("/admin", adminRoutes);

export default router;
