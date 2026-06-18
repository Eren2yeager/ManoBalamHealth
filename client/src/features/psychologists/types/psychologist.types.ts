import type { ConsultationMode, Money } from "@/types/global.types";

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

export interface Psychologist {
  id: string;
  name: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  yearsOfExperience: number;
  specializations: Specialization[];
  consultationModes: ConsultationMode[];
  sessionPrice: Money;
  timezone: string;
  rating?: number;
  reviewCount?: number;
  isVerified: boolean;
  isOnline: boolean;
}

export interface GetPsychologistsParams {
  page?: number;
  limit?: number;
  specialization?: Specialization;
  mode?: ConsultationMode;
}
