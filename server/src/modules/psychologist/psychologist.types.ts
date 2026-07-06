import type { IPsychologistProfile, IPsychologistPendingChanges } from "./psychologist.model";
import { buildPriceMatrix, SessionMode, SessionDuration } from "./psychologist.constants";

export interface UpdatePsychologistProfileRequest {
  specialization?: string[];
  languages?: string[];
  experienceYears?: number;
  consultationFee?: { amount: number; currency: string };
  bio?: string;
  licensedCountries?: string[];
  isAcceptingEmergency?: boolean;
}

export interface CredentialResponse {
  id: string;
  docUrl: string;
  type: string;
  verified: boolean;
  uploadedAt?: string;
}

export type PriceMatrix = Record<SessionMode, Record<SessionDuration, number>>;

export interface PsychologistListResponse {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  priceMatrix: PriceMatrix;
  rating: { average: number; count: number };
  isOnline: boolean;
  bio: string;
}

export interface PsychologistDetailResponse {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  priceMatrix: PriceMatrix;
  bio: string;
  rating: { average: number; count: number };
  isOnline: boolean;
  licensedCountries: string[];
  verificationStatus?: "pending" | "approved" | "rejected"; // only for self or admin
  onboardingStatus?: IPsychologistProfile["onboardingStatus"];
  rejectionReason?: string;
  credentials?: CredentialResponse[];
  missingFields?: string[];
  submittedAt?: string;
  isAcceptingEmergency?: boolean;
  presenceIntendedOnline?: boolean;
  pendingChanges?: IPsychologistPendingChanges;
  changeReviewStatus?: "pending" | "approved" | "rejected";
  changeRejectionReason?: string;
  changeSubmittedAt?: string;
}

export interface UploadCredentialsResponse {
  credentials: CredentialResponse[];
}

export interface PsychologistOnboardingResponse extends PsychologistDetailResponse {
  onboardingStatus: IPsychologistProfile["onboardingStatus"];
  verificationStatus: "pending" | "approved" | "rejected";
  credentials: CredentialResponse[];
  missingFields: string[];
}

export function toCredentialResponse(credential: any): CredentialResponse {
  return {
    id: credential._id?.toString?.() ?? "",
    docUrl: credential.docUrl,
    type: credential.type,
    verified: credential.verified,
    uploadedAt: credential.uploadedAt
      ? new Date(credential.uploadedAt).toISOString()
      : undefined,
  };
}

export function toPsychologistListResponse(
  profile: any,
): PsychologistListResponse {
  return {
    id: profile._id.toString(),
    name: profile.user?.name || "Unknown",
    avatarUrl: profile.user?.avatarUrl,
    specialization: profile.specialization,
    languages: profile.languages,
    experienceYears: profile.experienceYears,
    consultationFee: profile.consultationFee,
    priceMatrix: buildPriceMatrix(profile.consultationFee?.amount ?? 0),
    rating: profile.rating,
    isOnline: profile.isOnline,
    bio: profile.bio,
  };
}

export function toPsychologistDetailResponse(
  profile: any,
  includeSensitive: boolean = false,
): PsychologistDetailResponse {
  const response: PsychologistDetailResponse = {
    id: profile._id.toString(),
    name: profile.user?.name || "Unknown",
    avatarUrl: profile.user?.avatarUrl,
    specialization: profile.specialization,
    languages: profile.languages,
    experienceYears: profile.experienceYears,
    consultationFee: profile.consultationFee,
    priceMatrix: buildPriceMatrix(profile.consultationFee?.amount ?? 0),
    bio: profile.bio,
    rating: profile.rating,
    isOnline: profile.isOnline,
    licensedCountries: profile.licensedCountries,
  };
  if (includeSensitive) {
    response.verificationStatus = profile.verificationStatus;
    response.onboardingStatus = profile.onboardingStatus;
    response.rejectionReason = profile.rejectionReason;
    response.credentials = (profile.credentials ?? []).map(toCredentialResponse);
    response.submittedAt = profile.submittedAt?.toISOString?.();
    response.isAcceptingEmergency = profile.isAcceptingEmergency;
    response.presenceIntendedOnline = profile.presenceIntendedOnline;
    response.pendingChanges = profile.pendingChanges;
    response.changeReviewStatus = profile.changeReviewStatus;
    response.changeRejectionReason = profile.changeRejectionReason;
    response.changeSubmittedAt = profile.changeSubmittedAt?.toISOString?.();
  }
  return response;
}
