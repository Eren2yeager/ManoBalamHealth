import { PsychologistModel } from "../psychologist/psychologist.model";
import { UserModel } from "../user/user.model";
import { AppointmentModel, IAppointment } from "../appointment/appointment.model";
import { PaymentModel } from "../payment/payment.model";
import { ApiError } from "../../utils/ApiError";
import { StatusCodes } from "../../constants/statusCodes.constant";
import { ErrorCodes } from "../../constants/errorCodes.constant";
import { UpdatePsychologistStatusRequest, ProcessRefundRequest, PsychologistListItem, AppointmentListItem, ReportsSummary } from "./admin.types";
import { Types } from "mongoose";
import { sendEmail } from "@/modules/notification/channels/email.channel";
import { logger } from "@/utils/logger";
import { razorpayProvider } from "@/modules/payment/providers/razorpay.provider";

class AdminService {
  async getPsychologists(query: { page: number; limit: number; status?: "pending" | "approved" | "rejected" }) {
    const skip = (query.page - 1) * query.limit;
    const filter: any = query.status
      ? { verificationStatus: query.status }
      : { $or: [{ onboardingStatus: "under_review" }, { changeReviewStatus: "pending" }] };

    const psychologists = await PsychologistModel.find(filter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit);

    const total = await PsychologistModel.countDocuments(filter);

    const data: PsychologistListItem[] = psychologists.map((psychologist) => {
      const user = (psychologist as any).userId;
      return {
        id: psychologist._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        verificationStatus: psychologist.verificationStatus,
        onboardingStatus: psychologist.onboardingStatus,
        specialization: psychologist.specialization,
        languages: psychologist.languages,
        experienceYears: psychologist.experienceYears,
        consultationFee: psychologist.consultationFee,
        licensedCountries: psychologist.licensedCountries,
        bio: psychologist.bio,
        credentials: psychologist.credentials,
        submittedAt: psychologist.submittedAt?.toISOString(),
        rejectionReason: psychologist.rejectionReason,
        pendingChanges: psychologist.pendingChanges,
        changeReviewStatus: psychologist.changeReviewStatus,
        changeSubmittedAt: psychologist.changeSubmittedAt?.toISOString(),
        rating: psychologist.rating,
        createdAt: psychologist.createdAt.toISOString(),
      };
    });

    return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  async updatePsychologistStatus(
    psychologistId: string,
    data: UpdatePsychologistStatusRequest,
    adminUserId: string,
  ) {
    const psychologist = await PsychologistModel.findById(psychologistId);
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    if (psychologist.onboardingStatus !== "under_review") {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Only submitted applications can be reviewed",
      );
    }

    psychologist.verificationStatus = data.decision;
    psychologist.onboardingStatus = data.decision;
    psychologist.reviewedAt = new Date();
    psychologist.reviewedBy = new Types.ObjectId(adminUserId);
    psychologist.isOnline = false;
    psychologist.presenceIntendedOnline = false;
    if (data.decision === "rejected" && data.rejectionReason) {
      psychologist.rejectionReason = data.rejectionReason;
      psychologist.credentials.forEach((credential) => {
        credential.verified = false;
      });
    } else {
      psychologist.rejectionReason = undefined;
      psychologist.credentials.forEach((credential) => {
        credential.verified = true;
      });
    }
    await psychologist.save();

    try {
      const subject =
        data.decision === "approved"
          ? "Your ManoBalamHealthCare psychologist profile is approved"
          : "Changes requested for your ManoBalamHealthCare psychologist profile";
      const safeReason = (data.rejectionReason ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      const message =
        data.decision === "approved"
          ? "<p>Your professional profile has been approved. You can now publish availability and receive appointments.</p>"
          : `<p>Your application needs changes before approval.</p><p><strong>Reviewer note:</strong> ${safeReason}</p>`;
      await sendEmail(psychologist.userId.toString(), subject, message);
    } catch (error) {
      logger.error("Failed to send psychologist review notification", {
        error,
        metadata: { psychologistId },
      });
    }

    return { id: psychologistId, verificationStatus: data.decision };
  }

  /**
   * Review pending profile changes from an already-approved psychologist.
   * The live profile kept serving while the changes waited; approval merges
   * them in, rejection discards them with a reason. Either way the
   * psychologist stays approved and online status is untouched.
   */
  async reviewPendingChanges(
    psychologistId: string,
    data: UpdatePsychologistStatusRequest,
    adminUserId: string,
  ) {
    const psychologist = await PsychologistModel.findById(psychologistId);
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    if (psychologist.changeReviewStatus !== "pending") {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "This psychologist has no pending changes to review",
      );
    }

    if (data.decision === "approved") {
      // pendingChanges is a Mongoose subdocument — convert to a plain object
      // and merge only the known editable fields onto the live profile.
      const changes: Record<string, unknown> =
        (psychologist.pendingChanges as any)?.toObject?.() ?? psychologist.pendingChanges ?? {};
      const editableFields = [
        "specialization",
        "languages",
        "experienceYears",
        "consultationFee",
        "bio",
        "licensedCountries",
      ] as const;
      for (const key of editableFields) {
        if (changes[key] !== undefined && changes[key] !== null) {
          (psychologist as any)[key] = changes[key];
        }
      }
      // Newly uploaded documents were part of the reviewed change set
      psychologist.credentials.forEach((credential) => {
        credential.verified = true;
      });
      psychologist.changeRejectionReason = undefined;
    } else {
      psychologist.changeRejectionReason = data.rejectionReason;
    }

    psychologist.pendingChanges = undefined;
    psychologist.changeReviewStatus = data.decision;
    psychologist.reviewedAt = new Date();
    psychologist.reviewedBy = new Types.ObjectId(adminUserId);
    await psychologist.save();

    try {
      const subject =
        data.decision === "approved"
          ? "Your ManoBalamHealthCare profile changes are live"
          : "Your ManoBalamHealthCare profile changes were not approved";
      const safeReason = (data.rejectionReason ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      const message =
        data.decision === "approved"
          ? "<p>Your requested profile changes have been approved and are now visible to patients.</p>"
          : `<p>Your requested profile changes were rejected. Your previously approved profile remains live.</p><p><strong>Reviewer note:</strong> ${safeReason}</p>`;
      await sendEmail(psychologist.userId.toString(), subject, message);
    } catch (error) {
      logger.error("Failed to send pending-changes review notification", {
        error,
        metadata: { psychologistId },
      });
    }

    return { id: psychologistId, changeReviewStatus: data.decision };
  }

  async getAppointments(query: { page: number; limit: number; status?: IAppointment["status"] }) {
    const skip = (query.page - 1) * query.limit;
    const filter: any = query.status ? { status: query.status } : {};

    const appointments = await AppointmentModel.find(filter)
      .populate("patientId", "name")
      .populate("psychologistId")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(query.limit);

    for (const appt of appointments) {
      await (appt as any).populate("psychologistId.userId", "name");
    }

    const total = await AppointmentModel.countDocuments(filter);

    const data: AppointmentListItem[] = appointments.map((appt) => {
      const apptAny = appt as any;
      return {
        id: appt._id.toString(),
        patient: { id: apptAny.patientId._id.toString(), name: apptAny.patientId.name },
        psychologist: { id: apptAny.psychologistId._id.toString(), name: apptAny.psychologistId.userId.name },
        mode: appt.mode,
        status: appt.status,
        scheduledAt: appt.scheduledAt.toISOString(),
        allocationMode: appt.allocationMode,
        fee: (apptAny.psychologistId as any).consultationFee,
      };
    });

    return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  async getReportsSummary(): Promise<ReportsSummary> {
    const totalAppointments = await AppointmentModel.countDocuments();
    const completedAppointments = await AppointmentModel.countDocuments({ status: "completed" });
    const totalPsychologists = await PsychologistModel.countDocuments({ verificationStatus: "approved" });
    const totalPatients = await UserModel.countDocuments({ role: "patient" });

    const paidPayments = await PaymentModel.find({ status: "paid" });
    const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalAppointments,
      completedAppointments,
      totalRevenue,
      totalPsychologists,
      totalPatients,
    };
  }

  async processRefund(appointmentId: string, data: ProcessRefundRequest) {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    if (appointment.status === "refunded") {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "Appointment already refunded");
    }

    const payment = await PaymentModel.findOne({ appointmentId: appointment._id });
    if (!payment || payment.status !== "paid") {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "No paid payment found for this appointment");
    }

    const refundedAmount = data.amount ?? payment.amount;

    if (!payment.providerPaymentId) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "The payment provider ID is missing and the refund cannot be processed",
      );
    }

    const refund = await razorpayProvider.createRefund({
      paymentId: payment.providerPaymentId,
      amount: refundedAmount,
      notes: {
        appointmentId: appointment._id.toString(),
        reason: data.reason,
      },
    });

    // Update appointment status
    appointment.status = "refunded";
    await appointment.save();

    // Update payment record
    payment.status = "refunded";
    payment.refundReason = data.reason;
    payment.refundedAmount = refund.amount;
    await payment.save();

    return {
      paymentId: payment._id.toString(),
      status: "refunded" as const,
      refundedAmount: refund.amount,
    };
  }
}

export const adminService = new AdminService();
