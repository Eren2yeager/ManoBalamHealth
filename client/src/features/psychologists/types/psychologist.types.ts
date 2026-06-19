import type { Money, PaginationParams } from "@/types/global.types";

export type Specialization =
  | "anxiety"
  | "depression"
  | "relationships"
  | "stress"
  | "trauma"
  | "grief"
  | "self-esteem"
  | "sleep"
  | "work-life-balance"
  | "other";

export interface PsychologistListItem {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: Money;
  rating: { average: number; count: number };
  isOnline: boolean;
  bio: string;
}

export interface PsychologistDetail extends PsychologistListItem {
  licensedCountries: string[];
  verificationStatus?: "pending" | "approved" | "rejected"; // only present if requester is self or admin
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