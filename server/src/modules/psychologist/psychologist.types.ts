import type { IPsychologistProfile } from "./psychologist.model";
import type { IUser } from "../user/user.model";

export interface UpdatePsychologistProfileRequest {
  specialization?: string[];
  languages?: string[];
  experienceYears?: number;
  consultationFee?: { amount: number; currency: string };
  bio?: string;
  licensedCountries?: string[];
  isAcceptingEmergency?: boolean;
}

export interface PsychologistListResponse {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
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
  bio: string;
  rating: { average: number; count: number };
  isOnline: boolean;
  licensedCountries: string[];
  verificationStatus?: "pending" | "approved" | "rejected"; // only for self or admin
}

export interface UploadCredentialsResponse {
  credentials: Array<{ docUrl: string; type: string; verified: boolean }>;
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
    bio: profile.bio,
    rating: profile.rating,
    isOnline: profile.isOnline,
    licensedCountries: profile.licensedCountries,
  };
  if (includeSensitive) {
    response.verificationStatus = profile.verificationStatus;
  }
  return response;
}
