import { Types } from "mongoose";
import { AppointmentModel } from "./appointment.model";
import { AvailabilitySlotModel } from "@/modules/availability/availabilitySlot.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { UserModel } from "@/modules/user/user.model";
import { PaymentModel } from "@/modules/payment/payment.model";
import { FeedbackModel } from "@/modules/feedback/feedback.model";
import { appointmentLifecycleService } from "./appointmentLifecycle.service";
import { resolveAppointmentTiming } from "./appointmentTiming";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import {
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  AppointmentListItemResponse,
  AppointmentDetailResponse,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
} from "./appointment.types";

class AppointmentService {
  /**
   * Create appointment
   */
  async createAppointment(
    patientUserId: string,
    data: CreateAppointmentRequest
  ): Promise<CreateAppointmentResponse> {
    if (data.allocationMode === "manual") {
      return this.allocateManual(patientUserId, data);
    } else if (data.allocationMode === "auto") {
      return this.allocateAuto(patientUserId, data);
    } else {
      return this.allocateEmergency(patientUserId, data);
    }
  }

  /**
   * Allocate emergency appointment
   */
  private async allocateEmergency(
    patientUserId: string,
    data: CreateAppointmentRequest & { allocationMode: "emergency" }
  ): Promise<CreateAppointmentResponse> {
    // Get patient
    const patient = await UserModel.findById(patientUserId);
    if (!patient) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Patient not found");
    }

    // Find available psychologists who are accepting emergencies, approved, and online
    const psychologistFilter: any = {
      verificationStatus: "approved",
      isAcceptingEmergency: true,
    };

    if (data.specialization) {
      psychologistFilter.specialization = data.specialization;
    }

    const psychologists = await PsychologistModel.find(psychologistFilter).populate("userId");
    if (psychologists.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NO_PSYCHOLOGIST_AVAILABLE, "No eligible psychologists available for emergency");
    }

    // For now, just pick the first one (in real scenario, we'd use the socket broadcast)
    const psychologist = psychologists[0];
    const psychUser = (psychologist as any).userId;

    // Create appointment immediately (no slot needed for emergency?)
    // Or create an immediate slot? For now, let's just create an appointment with now as scheduledAt
    const appointment = await AppointmentModel.create({
      patientId: patient._id,
      psychologistId: psychologist._id,
      allocationMode: "emergency",
      mode: data.mode || "video", // default to video
      concernDescription: data.concernDescription,
      status: "confirmed", // Emergency goes straight to confirmed
      scheduledAt: new Date(),
    });

    return {
      appointmentId: appointment._id.toString(),
      status: appointment.status,
      psychologistId: psychologist._id.toString(),
      scheduledAt: appointment.scheduledAt.toISOString(),
      mode: appointment.mode,
      fee: psychologist.consultationFee,
    };
  }

  /**
   * Allocate auto appointment
   */
  private async allocateAuto(
    patientUserId: string,
    data: CreateAppointmentRequest & { allocationMode: "auto" }
  ): Promise<CreateAppointmentResponse> {
    // Get patient
    const patient = await UserModel.findById(patientUserId);
    if (!patient) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Patient not found");
    }

    // Find available slots in the preferred time window
    const preferredFrom = new Date(data.preferredFrom);
    const preferredTo = new Date(data.preferredTo);

    // Build filter for psychologists
    const psychologistFilter: any = {
      verificationStatus: "approved",
    };

    if (data.specialization) {
      psychologistFilter.specialization = data.specialization;
    }

    // Get approved psychologists
    const psychologists = await PsychologistModel.find(psychologistFilter);
    if (psychologists.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NO_PSYCHOLOGIST_AVAILABLE, "No eligible psychologists available");
    }

    const psychologistIds = psychologists.map((p) => p._id);

    // Find available slots
    const holdUntil = new Date(Date.now() + 10 * 60 * 1000);
    const appointmentId = new Types.ObjectId();
    const slot = await AvailabilitySlotModel.findOneAndUpdate({
      psychologistId: { $in: psychologistIds },
      startTime: { $gte: preferredFrom, $lte: preferredTo },
      mode: data.mode,
      isBooked: false,
      isBlocked: false,
      $or: [
        { holdExpiresAt: { $exists: false } },
        { holdExpiresAt: { $lt: new Date() } },
      ],
    }, {
      $set: { holdExpiresAt: holdUntil, heldByAppointmentId: appointmentId },
    }, {
      new: true,
      sort: { startTime: 1 },
    });

    if (!slot) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NO_PSYCHOLOGIST_AVAILABLE, "No available slots in the preferred time window");
    }

    // Get the psychologist for this slot
    const psychologist = await PsychologistModel.findById(slot.psychologistId).populate("userId");
    if (!psychologist) {
      await AvailabilitySlotModel.updateOne(
        { _id: slot._id, heldByAppointmentId: appointmentId },
        { $unset: { holdExpiresAt: 1, heldByAppointmentId: 1 } },
      );
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    // Mark slot as booked with 10‑minute hold
    let appointment;
    try {
      appointment = await AppointmentModel.create({
        _id: appointmentId,
        patientId: patient._id,
        psychologistId: psychologist._id,
        slotId: slot._id,
        allocationMode: "auto",
        mode: data.mode,
        concernDescription: data.concernDescription,
        status: "pending_payment",
        scheduledAt: slot.startTime,
      });
    } catch (error) {
      await AvailabilitySlotModel.updateOne(
        { _id: slot._id, heldByAppointmentId: appointmentId },
        { $unset: { holdExpiresAt: 1, heldByAppointmentId: 1 } },
      );
      throw error;
    }

    return {
      appointmentId: appointment._id.toString(),
      status: appointment.status,
      psychologistId: psychologist._id.toString(),
      scheduledAt: appointment.scheduledAt.toISOString(),
      mode: appointment.mode,
      fee: psychologist.consultationFee,
    };
  }

  /**
   * Allocate manual appointment
   */
  private async allocateManual(
    patientUserId: string,
    data: CreateAppointmentRequest & { allocationMode: "manual" }
  ): Promise<CreateAppointmentResponse> {
    // Get patient
    const patient = await UserModel.findById(patientUserId);
    if (!patient) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Patient not found");
    }

    const holdUntil = new Date(Date.now() + 10 * 60 * 1000);
    const appointmentId = new Types.ObjectId();
    const slot = await AvailabilitySlotModel.findOneAndUpdate(
      {
        _id: data.slotId,
        mode: data.mode,
        isBooked: false,
        isBlocked: false,
        $or: [
          { holdExpiresAt: { $exists: false } },
          { holdExpiresAt: { $lt: new Date() } },
        ],
      },
      { $set: { holdExpiresAt: holdUntil, heldByAppointmentId: appointmentId } },
      { new: true },
    );

    if (!slot) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.SLOT_ALREADY_BOOKED,
        "Slot is unavailable, already booked, or does not support this consultation mode",
      );
    }

    // Get psychologist
    const psychologist = await PsychologistModel.findById(slot.psychologistId).populate("userId");
    if (!psychologist) {
      await AvailabilitySlotModel.updateOne(
        { _id: slot._id, heldByAppointmentId: appointmentId },
        { $unset: { holdExpiresAt: 1, heldByAppointmentId: 1 } },
      );
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    // Check if psychologist is approved
    if (psychologist.verificationStatus !== "approved") {
      await AvailabilitySlotModel.updateOne(
        { _id: slot._id, heldByAppointmentId: appointmentId },
        { $unset: { holdExpiresAt: 1, heldByAppointmentId: 1 } },
      );
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.PSYCHOLOGIST_NOT_VERIFIED, "Psychologist is not verified");
    }

    // Mark slot as booked with 10‑minute hold
    let appointment;
    try {
      appointment = await AppointmentModel.create({
        _id: appointmentId,
        patientId: patient._id,
        psychologistId: psychologist._id,
        slotId: slot._id,
        allocationMode: "manual",
        mode: data.mode,
        concernDescription: data.concernDescription,
        status: "pending_payment",
        scheduledAt: slot.startTime,
      });
    } catch (error) {
      await AvailabilitySlotModel.updateOne(
        { _id: slot._id, heldByAppointmentId: appointmentId },
        { $unset: { holdExpiresAt: 1, heldByAppointmentId: 1 } },
      );
      throw error;
    }

    // Return response
    return {
      appointmentId: appointment._id.toString(),
      status: appointment.status,
      psychologistId: psychologist._id.toString(),
      scheduledAt: appointment.scheduledAt.toISOString(),
      mode: appointment.mode,
      fee: psychologist.consultationFee,
    };
  }

  /**
   * Get my appointments (patient or psychologist)
   */
  async getMyAppointments(
    userId: string,
    userRole: "patient" | "psychologist" | "admin",
    query: { page: number; limit: number; status?: string; upcoming?: boolean }
  ): Promise<{ data: AppointmentListItemResponse[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    // Get user's associated ID
    let filter: any = {};
    if (userRole === "patient") {
      // Patient sees their own appointments
      const patient = await UserModel.findById(userId);
      if (!patient) throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found");
      filter.patientId = patient._id;
    } else if (userRole === "psychologist") {
      // Psychologist sees their own appointments
      const psychologist = await PsychologistModel.findOne({ userId });
      if (!psychologist) throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
      filter.psychologistId = psychologist._id;
    }

    // Apply additional filters
    if (query.status) {
      filter.status = query.status;
    }
    if (query.upcoming) {
      filter.status = { $nin: ["completed", "cancelled", "no_show", "refunded"] };
    }

    // Pagination
    const skip = (query.page - 1) * query.limit;
    const [appointments, total] = await Promise.all([
      AppointmentModel.find(filter)
        .populate("patientId", "name avatarUrl")
        .populate("psychologistId")
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(query.limit),
      AppointmentModel.countDocuments(filter),
    ]);

    // Populate psychologist's user data
    for (const appt of appointments) {
      await (appt as any).populate("psychologistId.userId", "name avatarUrl");
      await appointmentLifecycleService.reconcileAppointmentDocument(appt);
    }

    const totalPages = Math.ceil(total / query.limit);

    // Convert to response
    const appointmentIds = appointments.map(a => a._id);
    const existingFeedbacks = await FeedbackModel.find({ appointmentId: { $in: appointmentIds } });
    const feedbackMap = new Map(existingFeedbacks.map(f => [f.appointmentId.toString(), f]));

    const data = await Promise.all(appointments.map(async (appt) => {
      const apptAny = appt as any;
      let otherParty;
      if (userRole === "patient") {
        const psychUser = apptAny.psychologistId?.userId;
        otherParty = {
          id: apptAny.psychologistId?._id.toString(),
          name: psychUser?.name || "Unknown",
          avatarUrl: psychUser?.avatarUrl,
        };
      } else {
        otherParty = {
          id: apptAny.patientId?._id.toString(),
          name: apptAny.patientId?.name || "Unknown",
          avatarUrl: apptAny.patientId?.avatarUrl,
        };
      }

      const timing = await resolveAppointmentTiming(appt);
      const feedback = feedbackMap.get(appt._id.toString());

      return {
        id: appt._id.toString(),
        otherParty,
        mode: appt.mode,
        status: appt.status,
        scheduledAt: appt.scheduledAt.toISOString(),
        scheduledEndsAt: timing.scheduledEndsAt.toISOString(),
        sessionAccessStartsAt: timing.sessionAccessStartsAt.toISOString(),
        purchasedDurationSeconds: timing.purchasedDurationSeconds,
        allocationMode: appt.allocationMode,
        hasFeedback: !!feedback,
        feedback: feedback ? {
          rating: feedback.rating,
          comment: feedback.comment,
          createdAt: feedback.createdAt.toISOString(),
        } : undefined,
      };
    }));

    return { data, meta: { page: query.page, limit: query.limit, total, totalPages } };
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(
    appointmentId: string,
    userId: string,
    userRole: "patient" | "psychologist" | "admin"
  ): Promise<AppointmentDetailResponse> {
    let appointment = await AppointmentModel.findById(appointmentId)
      .populate("patientId", "name avatarUrl")
      .populate("psychologistId");

    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    await appointmentLifecycleService.reconcileAppointmentDocument(appointment);
    appointment = await AppointmentModel.findById(appointmentId)
      .populate("patientId", "name avatarUrl")
      .populate("psychologistId");
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    await (appointment as any).populate("psychologistId.userId", "name avatarUrl");

    // Check if user is authorized
    const apptAny = appointment as any;
    const isAuthorized =
      userRole === "admin" ||
      apptAny.patientId._id.toString() === userId ||
      apptAny.psychologistId.userId._id.toString() === userId;

    if (!isAuthorized) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "You are not authorized to view this appointment");
    }

    // Get payment details if available
    let payment = null;
    if (appointment.paymentId) {
      const paymentDoc = await PaymentModel.findById(appointment.paymentId);
      if (paymentDoc) {
        payment = {
          status: paymentDoc.status,
          amount: paymentDoc.amount,
          currency: paymentDoc.currency,
        };
      }
    }

    // Build response
    const psychUser = apptAny.psychologistId?.userId;
    const timing = await resolveAppointmentTiming(appointment);
    const feedback = await FeedbackModel.findOne({ appointmentId: appointment._id });

    return {
      id: appointment._id.toString(),
      patient: {
        id: apptAny.patientId._id.toString(),
        name: apptAny.patientId.name,
        avatarUrl: apptAny.patientId.avatarUrl,
      },
      psychologist: {
        id: apptAny.psychologistId._id.toString(),
        name: psychUser?.name || "Unknown",
        avatarUrl: psychUser?.avatarUrl,
      },
      mode: appointment.mode,
      status: appointment.status,
      scheduledAt: appointment.scheduledAt.toISOString(),
      scheduledEndsAt: timing.scheduledEndsAt.toISOString(),
      sessionAccessStartsAt: timing.sessionAccessStartsAt.toISOString(),
      purchasedDurationSeconds: timing.purchasedDurationSeconds,
      concernDescription: appointment.concernDescription,
      allocationMode: appointment.allocationMode,
      payment,
      hasFeedback: !!feedback,
      feedback: feedback ? {
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: feedback.createdAt.toISOString(),
      } : undefined,
    };
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    appointmentId: string,
    userId: string,
    userRole: "patient" | "psychologist" | "admin",
    data: CancelAppointmentRequest
  ): Promise<CancelAppointmentResponse> {
    const appointment = await AppointmentModel.findById(appointmentId)
      .populate("patientId")
      .populate("psychologistId");

    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    await (appointment as any).populate("psychologistId.userId");

    // Check if user is authorized
    const apptAny = appointment as any;
    const isAuthorized =
      userRole === "admin" ||
      apptAny.patientId._id.toString() === userId ||
      apptAny.psychologistId.userId._id.toString() === userId;

    if (!isAuthorized) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "You are not authorized to cancel this appointment");
    }

    // Check if appointment can be cancelled
    if (["completed", "in_progress"].includes(appointment.status)) {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "Cannot cancel a completed or in-progress appointment");
    }

    // Update appointment
    appointment.status = "cancelled";
    appointment.cancellationReason = data.reason;
    await appointment.save();

    if (appointment.slotId) {
      await AvailabilitySlotModel.updateOne(
        { _id: appointment.slotId },
        {
          $set: { isBooked: false },
          $unset: { holdExpiresAt: 1, heldByAppointmentId: 1 },
        },
      );
    }

    return {
      id: appointment._id.toString(),
      status: appointment.status,
    };
  }
}

export const appointmentService = new AppointmentService();
