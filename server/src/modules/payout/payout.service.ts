import { Types } from "mongoose";
import { PayoutModel, IPayout } from "./payout.model";
import { PayoutBatchModel } from "./payout-batch.model";
import { PsychologistModel } from "../psychologist/psychologist.model";
import { AppointmentModel } from "../appointment/appointment.model";
import { PaymentModel } from "../payment/payment.model";
import { PayoutDetailsModel } from "./payout-details.model";
import { payoutDetailsService } from "./payout-details.service";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";

export interface PayoutReadinessItem {
  psychologistId: string;
  psychologistName: string;
  bankDetailStatus: "not_added" | "saved" | "needs_update" | "under_review";
  maskedAccountNumber: string;
  completedSessionCount: number;
  eligibleAppointmentIds: string[];
  eligibleAmount: number; // in paise
  paidAmount: number; // in paise
  outstandingBalance: number; // in paise
}

export interface PayoutReadinessResponse {
  data: PayoutReadinessItem[];
  meta: {
    total: number;
    totalEligibleAmount: number;
    totalPaidAmount: number;
    totalOutstanding: number;
  };
}

class PayoutService {
  /**
   * Get payout readiness for all psychologists
   * Shows which psychologists are ready for payout and their financial status
   */
  async getPayoutReadiness(): Promise<PayoutReadinessResponse> {
    // Get all approved psychologists
    const psychologists = await PsychologistModel.find({
      verificationStatus: "approved",
    }).populate("userId", "name");

    const readinessItems: PayoutReadinessItem[] = [];
    let totalEligibleAmount = 0;
    let totalPaidAmount = 0;
    let totalOutstanding = 0;

    for (const psychologist of psychologists) {
      const psychologistId = psychologist._id.toString();
      const psychologistName = (psychologist as any).userId?.name || "Unknown";

      // Get payout details status
      const payoutDetails = await PayoutDetailsModel.findOne({
        psychologistId: psychologist._id,
      });
      const bankDetailStatus = payoutDetails?.status || "not_added";
      const maskedAccountNumber = payoutDetails?.accountNumberLast4
        ? `•••• ${payoutDetails.accountNumberLast4}`
        : "Not set";

      // Get completed sessions count
      const completedAppointments = await AppointmentModel.countDocuments({
        psychologistId: psychologist._id,
        status: "completed",
      });

      // Calculate eligible amount (sum of completed appointments that haven't been paid)
      const payouts = await PayoutModel.find({
        psychologistId: psychologist._id,
      });

      const allocatedAppointmentIds = new Set(
        payouts.flatMap((payout) =>
          payout.coveredAppointments.map((alloc) => alloc.appointmentId.toString()),
        ),
      );

      const eligibleAppointments = await AppointmentModel.find({
        psychologistId: psychologist._id,
        status: "completed",
        _id: { $nin: Array.from(allocatedAppointmentIds).map((id) => new Types.ObjectId(id)) },
      }).populate("paymentId");

      const eligibleAmount = eligibleAppointments.reduce((sum, appointment) => {
        const payment = appointment.paymentId as any;
        return sum + (payment?.amount || 0);
      }, 0);

      const paidAmount = payouts
        .filter((payout) => payout.status === "paid")
        .reduce((sum, payout) => sum + payout.netAmount, 0);
      const outstandingBalance = eligibleAmount;

      totalEligibleAmount += eligibleAmount;
      totalPaidAmount += paidAmount;
      totalOutstanding += outstandingBalance;

      readinessItems.push({
        psychologistId,
        psychologistName,
        bankDetailStatus,
        maskedAccountNumber,
        completedSessionCount: completedAppointments,
        eligibleAppointmentIds: eligibleAppointments.map((appointment) => appointment._id.toString()),
        eligibleAmount,
        paidAmount,
        outstandingBalance,
      });
    }

    return {
      data: readinessItems,
      meta: {
        total: readinessItems.length,
        totalEligibleAmount,
        totalPaidAmount,
        totalOutstanding,
      },
    };
  }

  /**
   * Create a payout for a psychologist covering specific appointments
   */
  async createPayout(
    psychologistId: string,
    appointmentIds: string[],
    commissionRate?: number,
    adminUserId?: string,
  ) {
    const psychologist = await PsychologistModel.findById(psychologistId);
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    // Check if payout details exist and are valid
    const payoutDetails = await PayoutDetailsModel.findOne({
      psychologistId: psychologist._id,
    });
    if (!payoutDetails || payoutDetails.status !== "saved") {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        ErrorCodes.VALIDATION_ERROR,
        "Psychologist must have valid payout details before payout can be created",
      );
    }

    // Get appointments and validate they're completed and not already paid
    const appointments = await AppointmentModel.find({
      _id: { $in: appointmentIds.map((id) => new Types.ObjectId(id)) },
      psychologistId: psychologist._id,
      status: "completed",
    }).populate("paymentId");

    if (appointments.length !== appointmentIds.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        "Some appointments are not completed or don't belong to this psychologist",
      );
    }

    // Check for idempotency before creating the record. The unique multikey
    // index on coveredAppointments.appointmentId is the final guard against
    // concurrent requests allocating the same appointment twice.
    const existingPayouts = await PayoutModel.find({
      "coveredAppointments.appointmentId": { $in: appointmentIds.map((id) => new Types.ObjectId(id)) },
    });

    if (existingPayouts.length > 0) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Some appointments have already been allocated to a payout",
      );
    }

    // Calculate amounts
    const coveredAppointments = appointments.map((appointment) => {
      const payment = appointment.paymentId as any;
      return {
        appointmentId: appointment._id,
        amount: payment?.amount || 0,
      };
    });

    const grossAmount = coveredAppointments.reduce((sum, alloc) => sum + alloc.amount, 0);
    const commissionAmount = commissionRate ? Math.round((grossAmount * commissionRate) / 100) : 0;
    const netAmount = grossAmount - commissionAmount;

    // Create payout record
    const payout = await PayoutModel.create({
      psychologistId: psychologist._id,
      coveredAppointments,
      grossAmount,
      commissionAmount,
      netAmount,
      status: "eligible",
      processedBy: adminUserId ? new Types.ObjectId(adminUserId) : undefined,
      processedAt: adminUserId ? new Date() : undefined,
    });

    return {
      id: payout._id.toString(),
      psychologistId: payout.psychologistId.toString(),
      coveredAppointments: payout.coveredAppointments,
      grossAmount: payout.grossAmount,
      commissionAmount: payout.commissionAmount,
      netAmount: payout.netAmount,
      status: payout.status,
    };
  }

  /**
   * Get payout history with filters
   */
  async getPayouts(query: {
    page: number;
    limit: number;
    psychologistId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const skip = (query.page - 1) * query.limit;
    const filter: any = {};

    if (query.psychologistId) {
      filter.psychologistId = new Types.ObjectId(query.psychologistId);
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.createdAt.$lte = new Date(query.endDate);
      }
    }

    const [payouts, total] = await Promise.all([
      PayoutModel.find(filter)
        .populate("psychologistId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit),
      PayoutModel.countDocuments(filter),
    ]);

    const data = payouts.map((payout) => ({
      id: payout._id.toString(),
      psychologistId: payout.psychologistId.toString(),
      psychologistName: (payout.psychologistId as any)?.userId?.name || "Unknown",
      coveredAppointments: payout.coveredAppointments,
      grossAmount: payout.grossAmount,
      commissionAmount: payout.commissionAmount,
      netAmount: payout.netAmount,
      status: payout.status,
      provider: payout.provider,
      providerReference: payout.providerReference,
      manualPaymentMethod: payout.manualPaymentMethod,
      failureReason: payout.failureReason,
      processedAt: payout.processedAt?.toISOString(),
      completedAt: payout.completedAt?.toISOString(),
      createdAt: payout.createdAt.toISOString(),
    }));

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * Get payout details
   */
  async getPayoutById(payoutId: string) {
    const payout = await PayoutModel.findById(payoutId).populate("psychologistId");

    if (!payout) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Payout not found");
    }

    return {
      id: payout._id.toString(),
      psychologistId: payout.psychologistId.toString(),
      psychologistName: (payout.psychologistId as any)?.userId?.name || "Unknown",
      coveredAppointments: payout.coveredAppointments,
      grossAmount: payout.grossAmount,
      commissionAmount: payout.commissionAmount,
      netAmount: payout.netAmount,
      status: payout.status,
      provider: payout.provider,
      providerReference: payout.providerReference,
      manualPaymentMethod: payout.manualPaymentMethod,
      failureReason: payout.failureReason,
      holdReason: payout.holdReason,
      processedBy: payout.processedBy?.toString(),
      processedAt: payout.processedAt?.toISOString(),
      completedAt: payout.completedAt?.toISOString(),
      createdAt: payout.createdAt.toISOString(),
      updatedAt: payout.updatedAt.toISOString(),
    };
  }

  /**
   * Update payout status
   */
  async updatePayout(payoutId: string, data: {
    status?: "processing" | "paid" | "failed" | "on_hold";
    providerReference?: string;
    failureReason?: string;
    holdReason?: string;
  }, adminUserId?: string) {
    const payout = await PayoutModel.findById(payoutId);

    if (!payout) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Payout not found");
    }

    const updateData: any = {};

    if (data.status !== undefined) {
      if (payout.status === "paid" && data.status !== "paid") {
        throw new ApiError(
          StatusCodes.CONFLICT,
          ErrorCodes.VALIDATION_ERROR,
          "A paid payout cannot be changed",
        );
      }
      if (data.status === "paid" && !(data.providerReference ?? payout.providerReference)) {
        throw new ApiError(
          StatusCodes.UNPROCESSABLE_ENTITY,
          ErrorCodes.VALIDATION_ERROR,
          "A confirmed provider reference is required before marking a payout as paid",
        );
      }
      updateData.status = data.status;
      if (data.status === "paid") {
        updateData.completedAt = new Date();
      }
    }
    if (data.providerReference !== undefined) {
      updateData.providerReference = data.providerReference;
    }
    if (data.failureReason !== undefined) {
      updateData.failureReason = data.failureReason;
    }
    if (data.holdReason !== undefined) {
      updateData.holdReason = data.holdReason;
    }
    if (adminUserId && data.status !== undefined) {
      updateData.processedBy = new Types.ObjectId(adminUserId);
      updateData.processedAt = new Date();
    }

    const updated = await PayoutModel.findByIdAndUpdate(
      payoutId,
      updateData,
      { new: true },
    );

    if (!updated) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Failed to update payout");
    }

    return this.getPayoutById(payoutId);
  }

  /**
   * Returns unmasked destination information only at the point an admin is
   * about to make an offline transfer. It is intentionally not part of normal
   * payout list/detail responses.
   */
  async getManualPayoutInstructions(payoutId: string) {
    const payout = await PayoutModel.findById(payoutId).populate({
      path: "psychologistId",
      populate: { path: "userId", select: "name" },
    });

    if (!payout) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Payout not found");
    }
    if (payout.status === "paid") {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "This payout has already been paid");
    }

    const psychologistId = payout.psychologistId._id.toString();
    const payoutDetails = await PayoutDetailsModel.findOne({ psychologistId: payout.psychologistId._id });
    if (!payoutDetails || payoutDetails.status !== "saved") {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        ErrorCodes.VALIDATION_ERROR,
        "Saved payout details are required before a manual payout can be processed",
      );
    }

    return {
      payoutId: payout._id.toString(),
      psychologistId,
      psychologistName: (payout.psychologistId as any)?.userId?.name || "Unknown",
      amount: payout.netAmount,
      currency: "INR",
      accountHolderName: payoutDetails.accountHolderName,
      bankName: payoutDetails.bankName,
      accountNumber: await payoutDetailsService.getDecryptedAccountNumber(psychologistId),
      ifscCode: payoutDetails.ifscCode,
      accountType: payoutDetails.accountType,
      branchName: payoutDetails.branchName,
      upiId: payoutDetails.upiId,
    };
  }

  /** Record an offline bank/UPI payment after the administrator has sent it. */
  async completeManualPayout(
    payoutId: string,
    data: { paymentMethod: "bank_transfer" | "upi"; transactionReference: string },
    adminUserId: string,
  ) {
    const payout = await PayoutModel.findById(payoutId);
    if (!payout) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Payout not found");
    }
    if (payout.status === "paid") {
      throw new ApiError(StatusCodes.CONFLICT, ErrorCodes.VALIDATION_ERROR, "This payout has already been paid");
    }
    if (payout.status !== "eligible" && payout.status !== "processing") {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Only eligible or processing payouts can be recorded as manually paid",
      );
    }

    payout.status = "paid";
    payout.provider = "manual";
    payout.manualPaymentMethod = data.paymentMethod;
    payout.providerReference = data.transactionReference;
    payout.processedBy = new Types.ObjectId(adminUserId);
    payout.processedAt = new Date();
    payout.completedAt = new Date();
    await payout.save();

    return this.getPayoutById(payoutId);
  }
}

export const payoutService = new PayoutService();
