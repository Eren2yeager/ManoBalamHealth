import { Types } from "mongoose";
import { PayoutDetailsModel, IPayoutDetails } from "./payout-details.model";
import { PsychologistModel } from "../psychologist/psychologist.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { encrypt, decrypt, maskAccountNumber } from "@/utils/encryption";

export interface CreatePayoutDetailsRequest {
  psychologistId: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "savings" | "current";
  branchName?: string;
  upiId?: string;
}

export interface UpdatePayoutDetailsRequest {
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: "savings" | "current";
  branchName?: string;
  upiId?: string;
}

export interface MaskedPayoutDetails {
  id: string;
  psychologistId: string;
  accountHolderName: string;
  bankName: string;
  accountNumberLast4: string;
  maskedAccountNumber: string;
  ifscCode: string;
  accountType: "savings" | "current";
  branchName?: string;
  upiId?: string;
  status: "not_added" | "saved" | "needs_update" | "under_review";
  lastReviewedAt?: string;
  updatedAt: string;
}

class PayoutDetailsService {
  /**
   * Create payout details for a psychologist
   * Encrypts sensitive account number before storage
   */
  async createPayoutDetails(
    userId: string,
    data: CreatePayoutDetailsRequest,
  ): Promise<MaskedPayoutDetails> {
    // Verify the psychologist profile exists and belongs to the user
    const psychologist = await PsychologistModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!psychologist) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Psychologist profile not found",
      );
    }

    // Check if payout details already exist
    const existing = await PayoutDetailsModel.findOne({
      psychologistId: psychologist._id,
    });
    if (existing) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Payout details already exist. Use update instead.",
      );
    }

    // Encrypt the account number
    const encryptedAccountNumber = encrypt(data.accountNumber);
    const accountNumberLast4 = data.accountNumber.slice(-4);

    const payoutDetails = await PayoutDetailsModel.create({
      psychologistId: psychologist._id,
      accountHolderName: data.accountHolderName,
      bankName: data.bankName,
      accountNumber: encryptedAccountNumber,
      accountNumberLast4,
      ifscCode: data.ifscCode.toUpperCase(),
      accountType: data.accountType,
      branchName: data.branchName,
      upiId: data.upiId?.toLowerCase(),
      status: "saved",
    });

    return this.toMaskedResponse(payoutDetails);
  }

  /**
   * Update payout details for a psychologist
   * Requires re-entry of account number for security
   */
  async updatePayoutDetails(
    userId: string,
    data: UpdatePayoutDetailsRequest,
  ): Promise<MaskedPayoutDetails> {
    // Verify the psychologist profile exists and belongs to the user
    const psychologist = await PsychologistModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!psychologist) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Psychologist profile not found",
      );
    }

    const payoutDetails = await PayoutDetailsModel.findOne({
      psychologistId: psychologist._id,
    });
    if (!payoutDetails) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Payout details not found. Create them first.",
      );
    }

    // Prepare update object
    const updateData: any = {
      status: "needs_update",
      updatedAt: new Date(),
    };

    if (data.accountHolderName !== undefined) {
      updateData.accountHolderName = data.accountHolderName;
    }
    if (data.bankName !== undefined) {
      updateData.bankName = data.bankName;
    }
    if (data.accountNumber !== undefined) {
      // Encrypt new account number
      updateData.accountNumber = encrypt(data.accountNumber);
      updateData.accountNumberLast4 = data.accountNumber.slice(-4);
    }
    if (data.ifscCode !== undefined) {
      updateData.ifscCode = data.ifscCode.toUpperCase();
    }
    if (data.accountType !== undefined) {
      updateData.accountType = data.accountType;
    }
    if (data.branchName !== undefined) {
      updateData.branchName = data.branchName;
    }
    if (data.upiId !== undefined) {
      updateData.upiId = data.upiId.toLowerCase();
    }

    const updated = await PayoutDetailsModel.findByIdAndUpdate(
      payoutDetails._id,
      updateData,
      { new: true },
    );

    if (!updated) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Failed to update payout details",
      );
    }

    return this.toMaskedResponse(updated);
  }

  /**
   * Get masked payout details for a psychologist
   * Never returns the raw encrypted account number
   */
  async getMyPayoutDetails(userId: string): Promise<MaskedPayoutDetails | null> {
    const psychologist = await PsychologistModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!psychologist) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Psychologist profile not found",
      );
    }

    const payoutDetails = await PayoutDetailsModel.findOne({
      psychologistId: psychologist._id,
    });

    if (!payoutDetails) {
      return null;
    }

    return this.toMaskedResponse(payoutDetails);
  }

  /**
   * Get masked payout details for a psychologist (admin view)
   * Includes status for admin review
   */
  async getPayoutDetailsForAdmin(
    psychologistId: string,
  ): Promise<MaskedPayoutDetails | null> {
    const payoutDetails = await PayoutDetailsModel.findOne({
      psychologistId: new Types.ObjectId(psychologistId),
    });

    if (!payoutDetails) {
      return null;
    }

    return this.toMaskedResponse(payoutDetails);
  }

  /**
   * Admin can review and update payout details status
   */
  async reviewPayoutDetails(
    psychologistId: string,
    adminUserId: string,
    status: "saved" | "under_review",
  ): Promise<MaskedPayoutDetails> {
    const payoutDetails = await PayoutDetailsModel.findOne({
      psychologistId: new Types.ObjectId(psychologistId),
    });

    if (!payoutDetails) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Payout details not found",
      );
    }

    payoutDetails.status = status;
    payoutDetails.lastUpdatedBy = new Types.ObjectId(adminUserId);
    payoutDetails.lastReviewedAt = new Date();
    await payoutDetails.save();

    return this.toMaskedResponse(payoutDetails);
  }

  /**
   * Get decrypted account number for payout processing (admin only)
   * This should only be called when actually processing a payout
   */
  async getDecryptedAccountNumber(
    psychologistId: string,
  ): Promise<string> {
    const payoutDetails = await PayoutDetailsModel.findOne({
      psychologistId: new Types.ObjectId(psychologistId),
    });

    if (!payoutDetails) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Payout details not found",
      );
    }

    return decrypt(payoutDetails.accountNumber);
  }

  /**
   * Check if psychologist has valid payout details
   */
  async hasValidPayoutDetails(psychologistId: string): Promise<boolean> {
    const payoutDetails = await PayoutDetailsModel.findOne({
      psychologistId: new Types.ObjectId(psychologistId),
    });

    return payoutDetails !== null && payoutDetails.status === "saved";
  }

  /**
   * Convert payout details to masked response (never includes raw account number)
   */
  private toMaskedResponse(payoutDetails: IPayoutDetails): MaskedPayoutDetails {
    return {
      id: payoutDetails._id.toString(),
      psychologistId: payoutDetails.psychologistId.toString(),
      accountHolderName: payoutDetails.accountHolderName,
      bankName: payoutDetails.bankName,
      accountNumberLast4: payoutDetails.accountNumberLast4,
      maskedAccountNumber: maskAccountNumber(payoutDetails.accountNumberLast4),
      ifscCode: payoutDetails.ifscCode,
      accountType: payoutDetails.accountType,
      branchName: payoutDetails.branchName,
      upiId: payoutDetails.upiId,
      status: payoutDetails.status,
      lastReviewedAt: payoutDetails.lastReviewedAt?.toISOString(),
      updatedAt: payoutDetails.updatedAt.toISOString(),
    };
  }
}

export const payoutDetailsService = new PayoutDetailsService();
