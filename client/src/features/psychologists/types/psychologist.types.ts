import type { Money, PaginationParams } from "@/types/global.types";

export type PriceMatrix = Record<"chat" | "audio" | "video", Record<30 | 45 | 60, number>>;

export interface PsychologistListItem {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: Money;
  priceMatrix?: PriceMatrix;
  rating: { average: number; count: number };
  isOnline: boolean;
  bio: string;
}

export interface PsychologistDetail extends PsychologistListItem {
  licensedCountries: string[];
  verificationStatus?: "pending" | "approved" | "rejected"; // only present if requester is self or admin
  onboardingStatus?: PsychologistOnboardingStatus;
  rejectionReason?: string;
  credentials?: PsychologistCredential[];
  missingFields?: string[];
  submittedAt?: string;
  isAcceptingEmergency?: boolean;
  presenceIntendedOnline?: boolean;
  pendingChanges?: PsychologistPendingChanges;
  changeReviewStatus?: "pending" | "approved" | "rejected";
  changeRejectionReason?: string;
  changeSubmittedAt?: string;
}

export interface PsychologistPendingChanges {
  specialization?: string[];
  languages?: string[];
  experienceYears?: number;
  consultationFee?: Money;
  bio?: string;
  licensedCountries?: string[];
}

export type PsychologistOnboardingStatus =
  | "profile_incomplete"
  | "documents_pending"
  | "under_review"
  | "approved"
  | "rejected";

export interface PsychologistCredential {
  id: string;
  docUrl: string;
  type: "license" | "degree" | "id_proof";
  verified: boolean;
  uploadedAt?: string;
}

export interface PsychologistOnboarding extends PsychologistDetail {
  onboardingStatus: PsychologistOnboardingStatus;
  verificationStatus: "pending" | "approved" | "rejected";
  credentials: PsychologistCredential[];
  missingFields: string[];
}

export interface PsychologistListParams extends PaginationParams {
  specialization?: string; // comma-separated
  language?: string;
  country?: string;
  minRating?: number;
  sortBy?: "rating" | "experience" | "fee_asc" | "fee_desc";
}

export interface UpdatePsychologistProfileDto {
  specialization?: string[];
  languages?: string[];
  experienceYears?: number;
  consultationFee?: Money;
  bio?: string;
  licensedCountries?: string[];
  isAcceptingEmergency?: boolean;
}
