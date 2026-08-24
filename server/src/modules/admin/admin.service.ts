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
import { PayoutDetailsModel } from "@/modules/payout/payout-details.model";
import { AdminAuditModel } from "./admin-audit.model";
import { ContactRequestModel } from "@/modules/contact/contact.model";

class AdminService {
  async getUsers(query: { page: number; limit: number; role?: "patient" | "psychologist"; status?: "active" | "inactive"; search?: string }) {
    const filter: any = { role: query.role ? query.role : { $in: ["patient", "psychologist"] } };
    if (query.status) filter.isActive = query.status === "active";
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ name: new RegExp(escaped, "i") }, { email: new RegExp(escaped, "i") }, { phone: new RegExp(escaped, "i") }];
    }
    const skip = (query.page - 1) * query.limit;
    const [users, total] = await Promise.all([
      UserModel.find(filter).select("name email phone role country timezone isVerified isActive avatarUrl createdAt").sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
      UserModel.countDocuments(filter),
    ]);
    const psychologistProfiles = await PsychologistModel.find({ userId: { $in: users.map((user) => user._id) } }).select("userId onboardingStatus verificationStatus consultationFee").lean();
    const profileByUser = new Map(psychologistProfiles.map((profile) => [profile.userId.toString(), profile]));
    const [patientCounts, psychologistCounts] = await Promise.all([
      AppointmentModel.aggregate([{ $match: { patientId: { $in: users.map((user) => user._id) } } }, { $group: { _id: "$patientId", count: { $sum: 1 } } }]),
      AppointmentModel.aggregate([{ $match: { psychologistId: { $in: psychologistProfiles.map((profile) => profile._id) } } }, { $group: { _id: "$psychologistId", count: { $sum: 1 } } }]),
    ]);
    const patientCountByUser = new Map(patientCounts.map((entry) => [entry._id.toString(), entry.count]));
    const psychologistCountByProfile = new Map(psychologistCounts.map((entry) => [entry._id.toString(), entry.count]));
    return {
      data: users.map((user) => {
        const profile = profileByUser.get(user._id.toString());
        return {
          id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: user.role,
          country: user.country, timezone: user.timezone, isVerified: user.isVerified, isActive: user.isActive,
          avatarUrl: user.avatarUrl, createdAt: user.createdAt.toISOString(),
          appointmentCount: user.role === "patient" ? patientCountByUser.get(user._id.toString()) ?? 0 : profile ? psychologistCountByProfile.get(profile._id.toString()) ?? 0 : 0,
          psychologist: profile ? { onboardingStatus: profile.onboardingStatus, verificationStatus: profile.verificationStatus, consultationFee: profile.consultationFee } : undefined,
        };
      }),
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async getContactRequests(query: { page: number; limit: number; status?: "new" | "in_progress" | "resolved"; search?: string }) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: new RegExp(escaped, "i") },
        { email: new RegExp(escaped, "i") },
        { subject: new RegExp(escaped, "i") },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [requests, total] = await Promise.all([
      ContactRequestModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
      ContactRequestModel.countDocuments(filter),
    ]);
    return {
      data: requests.map((request) => ({
        id: request._id.toString(),
        name: request.name,
        email: request.email,
        phone: request.phone,
        subject: request.subject,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
      })),
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async updateContactRequest(requestId: string, data: { status: "new" | "in_progress" | "resolved" }) {
    const request = await ContactRequestModel.findByIdAndUpdate(
      requestId,
      { status: data.status },
      { new: true },
    ).lean();
    if (!request) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Contact request not found");
    }
    return {
      id: request._id.toString(),
      status: request.status,
      updatedAt: request.updatedAt.toISOString(),
    };
  }

  async getAuditLogs(query: { page: number; limit: number; action?: string }) {
    const filter: any = {};
    if (query.action) filter.action = query.action;
    const skip = (query.page - 1) * query.limit;
    const [logs, total] = await Promise.all([
      AdminAuditModel.find(filter)
        .populate("adminId", "name email avatarUrl")
        .populate("targetUserId", "name email role avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      AdminAuditModel.countDocuments(filter),
    ]);
    return {
      data: logs.map((log: any) => ({
        id: log._id.toString(),
        action: log.action,
        reason: log.reason,
        admin: log.adminId ? {
          id: log.adminId._id.toString(),
          name: log.adminId.name,
          email: log.adminId.email,
          avatarUrl: log.adminId.avatarUrl,
        } : undefined,
        targetUser: log.targetUserId ? {
          id: log.targetUserId._id.toString(),
          name: log.targetUserId.name,
          email: log.targetUserId.email,
          role: log.targetUserId.role,
          avatarUrl: log.targetUserId.avatarUrl,
        } : undefined,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
      })),
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  }

  async updateUserActivity(userId: string, data: { isActive: boolean; reason: string }, adminUserId: string) {
    if (userId === adminUserId) throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "You cannot change your own account status");
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found");
    if (user.role === "admin") throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "Admin accounts cannot be managed here");
    if (user.isActive === data.isActive) return { id: user._id.toString(), isActive: user.isActive };
    user.isActive = data.isActive;
    user.authVersion += 1;
    await user.save();
    await AdminAuditModel.create({ adminId: new Types.ObjectId(adminUserId), targetUserId: user._id, action: data.isActive ? "account_activated" : "account_suspended", reason: data.reason });
    return { id: user._id.toString(), isActive: user.isActive };
  }

  async getUserDetail(userId: string) {
    const user = await UserModel.findById(userId)
      .select("name email phone role age gender emergencyContact country timezone isVerified isActive avatarUrl createdAt updatedAt")
      .lean();
    if (!user || user.role === "admin") throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found");
    const profile = user.role === "psychologist"
      ? await PsychologistModel.findOne({ userId: user._id }).select("specialization languages experienceYears bio licensedCountries onboardingStatus verificationStatus consultationFee rating isOnline").lean()
      : null;
    const appointmentFilter = user.role === "patient" ? { patientId: user._id } : { psychologistId: profile?._id };
    const appointments = await AppointmentModel.find(appointmentFilter)
      .populate("patientId", "name avatarUrl")
      .populate({ path: "psychologistId", populate: { path: "userId", select: "name avatarUrl" } })
      .sort({ scheduledAt: -1 }).limit(10).lean();
    return {
      id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: user.role,
      age: user.age, gender: user.gender, country: user.country, timezone: user.timezone, isVerified: user.isVerified,
      isActive: user.isActive, avatarUrl: user.avatarUrl, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
      emergencyContact: user.emergencyContact,
      psychologist: profile ? { specialization: profile.specialization, languages: profile.languages, experienceYears: profile.experienceYears, bio: profile.bio, licensedCountries: profile.licensedCountries, onboardingStatus: profile.onboardingStatus, verificationStatus: profile.verificationStatus, consultationFee: profile.consultationFee, rating: profile.rating, isOnline: profile.isOnline } : undefined,
      appointments: appointments.map((appointment: any) => ({ id: appointment._id.toString(), scheduledAt: appointment.scheduledAt.toISOString(), status: appointment.status, mode: appointment.mode, patient: { id: appointment.patientId._id.toString(), name: appointment.patientId.name, avatarUrl: appointment.patientId.avatarUrl }, psychologist: { id: appointment.psychologistId.userId._id.toString(), name: appointment.psychologistId.userId.name, avatarUrl: appointment.psychologistId.userId.avatarUrl } })),
    };
  }

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
    const payoutDetails = await PayoutDetailsModel.find({
      psychologistId: { $in: psychologists.map((psychologist) => psychologist._id) },
    }).lean();
    const payoutDetailsByPsychologist = new Map(
      payoutDetails.map((detail) => [detail.psychologistId.toString(), detail]),
    );

    const data: PsychologistListItem[] = psychologists.map((psychologist) => {
      const user = (psychologist as any).userId;
      const payoutDetail = payoutDetailsByPsychologist.get(psychologist._id.toString());
      // Ignore legacy pending values that are identical to the live profile.
      // Older clients submitted every onboarding field, which made reviews
      // appear to contain changes even when nothing had actually changed.
      const pendingChanges = Object.fromEntries(
        Object.entries((psychologist.pendingChanges as any)?.toObject?.() ?? psychologist.pendingChanges ?? {})
          .filter(([key, value]) => JSON.stringify(value) !== JSON.stringify((psychologist as any)[key])),
      );
      return {
        id: psychologist._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        avatarUrl: user.avatarUrl,
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
        pendingChanges: Object.keys(pendingChanges).length > 0 ? pendingChanges : undefined,
        changeReviewStatus: psychologist.changeReviewStatus,
        changeSubmittedAt: psychologist.changeSubmittedAt?.toISOString(),
        rating: psychologist.rating,
        createdAt: psychologist.createdAt.toISOString(),
        payoutDetails: payoutDetail ? {
          bankName: payoutDetail.bankName,
          maskedAccountNumber: `•••• ${payoutDetail.accountNumberLast4}`,
          status: payoutDetail.status,
          updatedAt: payoutDetail.updatedAt.toISOString(),
        } : undefined,
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

    // Require fee confirmation before approving new psychologists
    if (data.decision === "approved") {
      if (!psychologist.consultationFee?.amount || psychologist.consultationFee.amount <= 0) {
        throw new ApiError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          ErrorCodes.VALIDATION_ERROR,
          "Psychologist must have a consultation fee set before approval. Please set the fee first.",
        );
      }
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
      .populate("patientId", "name avatarUrl")
      .populate("psychologistId")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(query.limit);

    for (const appt of appointments) {
      await (appt as any).populate("psychologistId.userId", "name avatarUrl");
    }

    const total = await AppointmentModel.countDocuments(filter);

    const data: AppointmentListItem[] = appointments.map((appt) => {
      const apptAny = appt as any;
      return {
        id: appt._id.toString(),
        patient: { id: apptAny.patientId._id.toString(), name: apptAny.patientId.name, avatarUrl: apptAny.patientId.avatarUrl },
        psychologist: { id: apptAny.psychologistId.userId._id.toString(), name: apptAny.psychologistId.userId.name, avatarUrl: apptAny.psychologistId.userId.avatarUrl },
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
