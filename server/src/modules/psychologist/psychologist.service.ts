import { Types } from "mongoose";
import { PsychologistModel, IPsychologistProfile } from "./psychologist.model";
import { FeeHistoryModel } from "./fee-history.model";
import { PayoutDetailsModel } from "../payout/payout-details.model";
import { UserModel } from "../user/user.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { cloudinary } from "@/config/cloudinary";
import { Readable } from "stream";
import {
  UpdatePsychologistProfileRequest,
  PsychologistListResponse,
  PsychologistDetailResponse,
  UploadCredentialsResponse,
  toPsychologistListResponse,
  toPsychologistDetailResponse,
  toCredentialResponse,
} from "./psychologist.types";
import {
  SPECIALIZATIONS,
  LANGUAGES,
  COUNTRIES,
  CREDENTIAL_TYPES,
  FEE_MULTIPLIERS,
} from "./psychologist.constants";
import type { Role } from "@/constants/roles.constant";

export class PsychologistService {
  private getMissingFields(profile: IPsychologistProfile): string[] {
    const missing: string[] = [];
    if (profile.specialization.length === 0) missing.push("specialization");
    if (profile.languages.length === 0) missing.push("languages");
    if (profile.experienceYears < 0) missing.push("experienceYears");
    // consultationFee removed - now managed by admin only
    if (!profile.bio || profile.bio.trim().length < 50) missing.push("bio");
    if (profile.licensedCountries.length === 0) missing.push("licensedCountries");
    const credentialTypes = new Set(profile.credentials.map((credential) => credential.type));
    for (const type of ["license", "degree", "id_proof"]) {
      if (!credentialTypes.has(type)) missing.push(`${type}Credential`);
    }
    return missing;
  }

  private async ensureEditable(profile: IPsychologistProfile): Promise<void> {
    if (profile.onboardingStatus === "under_review") {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Your application is under review and cannot be edited",
      );
    }
  }

  async getOrCreateProfile(userId: string): Promise<IPsychologistProfile> {
    let profile = await PsychologistModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!profile) {
      profile = await PsychologistModel.create({
        userId: new Types.ObjectId(userId),
        specialization: [],
        languages: [],
        experienceYears: 0,
        consultationFee: { amount: 0, currency: "INR" },
        bookingPriority: 0,
        bio: "",
        credentials: [],
        licensedCountries: [],
        verificationStatus: "pending",
        onboardingStatus: "profile_incomplete",
        rating: { average: 0, count: 0 },
        isOnline: false,
        isAcceptingEmergency: false,
      });
    }
    return profile;
  }

  async getMyOnboarding(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    const populated = await profile.populate({
      path: "userId",
      select: "name avatarUrl",
      model: "User",
    });
    const profileWithUser: any = populated.toObject();
    profileWithUser.user = populated.userId;
    const response = toPsychologistDetailResponse(profileWithUser, true);
    return {
      ...response,
      onboardingStatus: profile.onboardingStatus,
      verificationStatus: profile.verificationStatus,
      credentials: profile.credentials.map(toCredentialResponse),
      missingFields: this.getMissingFields(profile),
    };
  }

  getMeta() {
    return {
      specializations: SPECIALIZATIONS,
      languages: LANGUAGES,
      countries: COUNTRIES,
      credentialTypes: CREDENTIAL_TYPES,
      feeMultipliers: FEE_MULTIPLIERS,
    };
  }

  async getPsychologists(
    query: {
      page: number;
      limit: number;
      specialization?: string;
      language?: string;
      country?: string;
      minRating?: number;
      sortBy: "rating" | "experience" | "fee_asc" | "fee_desc";
    },
    requesterCountry?: string,
  ): Promise<{ data: PsychologistListResponse[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const filter: any = {
      verificationStatus: "approved",
    };

    if (query.specialization) {
      const specializations = query.specialization.split(",").map(s => s.trim());
      filter.specialization = { $in: specializations };
    }

    if (query.language) {
      filter.languages = { $in: [query.language] };
    }

    const country = query.country || requesterCountry;
    if (country) {
      filter.licensedCountries = { $in: [country] };
    }

    if (query.minRating !== undefined) {
      filter["rating.average"] = { $gte: query.minRating };
    }

    let sort: any = {};
    switch (query.sortBy) {
      case "rating":
        sort = { "rating.average": -1, "rating.count": -1 };
        break;
      case "experience":
        sort = { experienceYears: -1 };
        break;
      case "fee_asc":
        sort = { "consultationFee.amount": 1 };
        break;
      case "fee_desc":
        sort = { "consultationFee.amount": -1 };
        break;
    }

    const skip = (query.page - 1) * query.limit;

    const [profiles, total] = await Promise.all([
      PsychologistModel.find(filter)
        .populate({
          path: "userId",
          select: "name avatarUrl",
          model: "User",
        })
        .sort({ bookingPriority: -1, ...sort })
        .skip(skip)
        .limit(query.limit),
      PsychologistModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    const data = profiles.map(profile => {
      // Add the user data to the profile object
      const profileWithUser: any = profile.toObject();
      profileWithUser.user = profile.userId;
      return toPsychologistListResponse(profileWithUser);
    });

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async getPsychologistById(
    id: string,
    requesterId?: string,
    requesterRole?: Role,
  ): Promise<PsychologistDetailResponse> {
    const profile = await PsychologistModel.findById(id).populate({
      path: "userId",
      select: "name avatarUrl",
      model: "User",
    });
    if (!profile) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    // Check if requester is the psychologist themselves or an admin
    const userIdFromProfile = (profile.userId as any)._id
      ? (profile.userId as any)._id.toString()
      : profile.userId.toString();

    const includeSensitive =
      requesterId !== undefined &&
      (userIdFromProfile === requesterId || requesterRole === "admin");

    if (!includeSensitive && profile.verificationStatus !== "approved") {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        ErrorCodes.NOT_FOUND,
        "Psychologist profile not found",
      );
    }

    // Add user data
    const profileWithUser: any = profile.toObject();
    profileWithUser.user = profile.userId;

    return toPsychologistDetailResponse(profileWithUser, includeSensitive);
  }

  async updateMyProfile(
    userId: string,
    data: UpdatePsychologistProfileRequest,
  ): Promise<PsychologistDetailResponse> {
    const profile = await this.getOrCreateProfile(userId);
    await this.ensureEditable(profile);

    // Check if the ONLY isAcceptingEmergency is the only field being updated
    const isOnlyAcceptingEmergencyUpdate =
      Object.keys(data).length === 1 &&
      "isAcceptingEmergency" in data;

    const isApproved = profile.onboardingStatus === "approved";

    let updateQuery: any;

    if (isOnlyAcceptingEmergencyUpdate) {
      updateQuery = { ...data };
    } else if (isApproved) {
      // Approved profiles stay live. Retain only fields which genuinely differ
      // from the live profile; legacy clients previously re-sent every field
      // and created misleading no-op change requests.
      const { isAcceptingEmergency, ...professionalFields } = data;
      const valuesMatch = (left: unknown, right: unknown) =>
        JSON.stringify(left) === JSON.stringify(right);
      const actualChanges = Object.fromEntries(
        Object.entries(professionalFields).filter(([key, value]) =>
          !valuesMatch(value, (profile as any)[key]),
        ),
      );
      const existingPending = (profile.pendingChanges as any)?.toObject?.() ?? profile.pendingChanges ?? {};
      const retainedPending = Object.fromEntries(
        Object.entries(existingPending).filter(([key, value]) =>
          value !== undefined && value !== null && !valuesMatch(value, (profile as any)[key]),
        ),
      );
      const nextPending = { ...retainedPending, ...actualChanges };
      updateQuery = {
        $set: {
          ...(isAcceptingEmergency !== undefined ? { isAcceptingEmergency } : {}),
          ...Object.fromEntries(
            Object.entries(nextPending).map(([key, value]) => [
              `pendingChanges.${key}`,
              value,
            ]),
          ),
          ...(Object.keys(nextPending).length > 0 ? { changeReviewStatus: "pending", changeSubmittedAt: new Date() } : {}),
        },
        $unset: {
          changeRejectionReason: 1,
          ...(Object.keys(nextPending).length === 0 ? { pendingChanges: 1, changeReviewStatus: 1, changeSubmittedAt: 1 } : {}),
        },
      };
    } else {
      // First-time onboarding flow: edit live fields directly.
      updateQuery = { ...data };
      const nextStatus =
        profile.onboardingStatus === "rejected" ? "profile_incomplete" : profile.onboardingStatus;
      updateQuery.onboardingStatus = nextStatus;
      updateQuery.$unset = { rejectionReason: 1, reviewedAt: 1, reviewedBy: 1 };
    }

    const updatedProfile = await PsychologistModel.findByIdAndUpdate(
      profile._id,
      updateQuery,
      { returnDocument: "after", runValidators: true },
    ).populate({
      path: "userId",
      select: "name avatarUrl",
      model: "User",
    });

    if (!updatedProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist profile not found");
    }

    const profileWithUser: any = updatedProfile.toObject();
    profileWithUser.user = updatedProfile.userId;

    return toPsychologistDetailResponse(profileWithUser, true);
  }

  async uploadCredentials(
    userId: string,
    files: Express.Multer.File[],
    type: "license" | "degree" | "id_proof",
  ): Promise<UploadCredentialsResponse> {
    const profile = await this.getOrCreateProfile(userId);
    await this.ensureEditable(profile);

    // Upload each file to Cloudinary
    const uploadPromises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "manobalam/credentials",
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result?.secure_url) {
              reject(
                new ApiError(
                  StatusCodes.INTERNAL_SERVER_ERROR,
                  ErrorCodes.INTERNAL_ERROR,
                  "Failed to upload document",
                ),
              );
            } else {
              resolve(result.secure_url);
            }
          },
        );
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });
    });

    const docUrls = await Promise.all(uploadPromises);

    // Add new credentials to profile
    const newCredentials = docUrls.map(docUrl => ({
      docUrl,
      type,
      verified: false,
      uploadedAt: new Date(),
    }));

    const isApproved = profile.onboardingStatus === "approved";

    const updateQuery: any = isApproved
      ? {
          // Approved profiles stay live; new documents just flag the profile
          // for admin re-review alongside any pending field changes.
          $push: { credentials: { $each: newCredentials } },
          $set: { changeReviewStatus: "pending", changeSubmittedAt: new Date() },
          $unset: { changeRejectionReason: 1 },
        }
      : {
          $push: { credentials: { $each: newCredentials } },
          $set: {
            onboardingStatus: "documents_pending",
            verificationStatus: "pending",
            isOnline: false,
            presenceIntendedOnline: false,
          },
          $unset: { rejectionReason: 1, reviewedAt: 1, reviewedBy: 1 },
        };

    const updatedProfile = await PsychologistModel.findByIdAndUpdate(
      profile._id,
      updateQuery,
      { new: true },
    );

    if (!updatedProfile) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist profile not found");
    }

    return {
      credentials: updatedProfile.credentials.map(toCredentialResponse),
    };
  }

  async deleteCredential(userId: string, credentialId: string) {
    const profile = await this.getOrCreateProfile(userId);
    await this.ensureEditable(profile);

    if (profile.onboardingStatus === "approved") {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Approved credentials cannot be deleted. Upload a replacement instead.",
      );
    }

    const credential = profile.credentials.id(credentialId);
    if (!credential) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Credential not found");
    }
    if (credential.verified) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Verified credentials cannot be deleted",
      );
    }

    credential.deleteOne();
    await profile.save();

    return { credentials: profile.credentials.map(toCredentialResponse) };
  }

  async submitForReview(userId: string) {
    const profile = await this.getOrCreateProfile(userId);
    await this.ensureEditable(profile);
    const missingFields = this.getMissingFields(profile);
    if (missingFields.length > 0) {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        ErrorCodes.PSYCHOLOGIST_ONBOARDING_INCOMPLETE,
        "Complete all professional details and credentials before submitting",
        { missingFields },
      );
    }

    // Check for valid payout details
    const payoutDetails = await PayoutDetailsModel.findOne({
      psychologistId: profile._id,
    });
    if (!payoutDetails || payoutDetails.status !== "saved") {
      throw new ApiError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        ErrorCodes.PSYCHOLOGIST_ONBOARDING_INCOMPLETE,
        "Add your bank details for payouts before submitting for review",
        { missingFields: [...missingFields, "bankDetails"] },
      );
    }

    profile.onboardingStatus = "under_review";
    profile.verificationStatus = "pending";
    profile.submittedAt = new Date();
    profile.rejectionReason = undefined;
    profile.isOnline = false;
    profile.presenceIntendedOnline = false;
    await profile.save();

    return {
      id: profile._id.toString(),
      onboardingStatus: profile.onboardingStatus,
      submittedAt: profile.submittedAt.toISOString(),
    };
  }

  /**
   * Admin-only: Set psychologist's consultation fee with audit trail
   */
  async setPsychologistFee(
    psychologistId: string,
    amount: number,
    currency: string,
    adminUserId: string,
    reason?: string,
  ) {
    const psychologist = await PsychologistModel.findById(psychologistId);
    if (!psychologist) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Psychologist not found");
    }

    const previousAmount = psychologist.consultationFee.amount;

    // Record fee change in audit history
    await FeeHistoryModel.create({
      psychologistId: psychologist._id,
      previousAmount,
      newAmount: amount,
      currency,
      changedBy: new Types.ObjectId(adminUserId),
      changeReason: reason,
    });

    // Update the psychologist's fee
    psychologist.consultationFee = { amount, currency };
    await psychologist.save();

    return {
      id: psychologistId,
      consultationFee: psychologist.consultationFee,
      previousAmount,
      newAmount: amount,
    };
  }

  /**
   * Admin-only: Set one consultation fee for many psychologists at once.
   * Each changed psychologist still receives an individual audit-history row.
   */
  async bulkSetPsychologistFee(
    amount: number,
    currency: string,
    adminUserId: string,
    reason?: string,
    psychologistIds?: string[],
  ) {
    const filter = psychologistIds?.length
      ? { _id: { $in: psychologistIds.map((id) => new Types.ObjectId(id)) } }
      : {};
    const psychologists = await PsychologistModel.find(filter);

    if (psychologists.length === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "No psychologists found for fee update");
    }

    const changedPsychologists = psychologists.filter(
      (psychologist) =>
        psychologist.consultationFee.amount !== amount ||
        psychologist.consultationFee.currency !== currency,
    );

    if (changedPsychologists.length > 0) {
      await FeeHistoryModel.insertMany(
        changedPsychologists.map((psychologist) => ({
          psychologistId: psychologist._id,
          previousAmount: psychologist.consultationFee.amount,
          newAmount: amount,
          currency,
          changedBy: new Types.ObjectId(adminUserId),
          changeReason: reason,
        })),
      );

      await PsychologistModel.bulkWrite(
        changedPsychologists.map((psychologist) => ({
          updateOne: {
            filter: { _id: psychologist._id },
            update: { $set: { consultationFee: { amount, currency } } },
          },
        })),
      );
    }

    return {
      matchedCount: psychologists.length,
      updatedCount: changedPsychologists.length,
      skippedCount: psychologists.length - changedPsychologists.length,
      consultationFee: { amount, currency },
    };
  }

  /**
   * Admin-only: Get fee history for a psychologist
   */
  async getFeeHistory(psychologistId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      FeeHistoryModel.find({ psychologistId: new Types.ObjectId(psychologistId) })
        .populate("changedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FeeHistoryModel.countDocuments({ psychologistId: new Types.ObjectId(psychologistId) }),
    ]);

    return {
      data: history.map((entry) => ({
        id: entry._id.toString(),
        previousAmount: entry.previousAmount,
        newAmount: entry.newAmount,
        currency: entry.currency,
        changedBy: (entry.changedBy as any)?.name || "Unknown",
        changedById: entry.changedBy?.toString(),
        changeReason: entry.changeReason,
        createdAt: entry.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const psychologistService = new PsychologistService();
