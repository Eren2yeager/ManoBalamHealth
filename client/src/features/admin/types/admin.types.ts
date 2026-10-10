import type { PaginationParams, AppointmentStatus } from "@/types/global.types";

export interface PendingPsychologistItem {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  verificationStatus: "pending" | "approved" | "rejected";
  onboardingStatus: "profile_incomplete" | "documents_pending" | "under_review" | "approved" | "rejected";
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  bookingPriority: number;
  licensedCountries: string[];
  bio: string;
  credentials: Array<{ docUrl: string; type: string; verified: boolean }>;
  submittedAt?: string;
  rejectionReason?: string;
  pendingChanges?: PsychologistPendingChanges;
  changeReviewStatus?: "pending" | "approved" | "rejected";
  changeSubmittedAt?: string;
  createdAt: string;
  payoutDetails?: {
    bankName: string;
    maskedAccountNumber: string;
    status: "not_added" | "saved" | "needs_update" | "under_review";
    updatedAt: string;
  };
}

export interface PsychologistPendingChanges {
  specialization?: string[];
  languages?: string[];
  experienceYears?: number;
  bio?: string;
  licensedCountries?: string[];
}

export interface VerifyPsychologistDto {
  decision: "approved" | "rejected";
  rejectionReason?: string;
}

export interface AdminAppointmentItem {
  id: string;
  patient: { id: string; name: string; avatarUrl?: string };
  psychologist: { id: string; name: string; avatarUrl?: string };
  status: AppointmentStatus;
  mode?: "chat" | "audio" | "video";
  allocationMode?: "manual" | "auto" | "emergency";
  paymentId?: string;
  paymentStatus?: "created" | "paid" | "failed" | "refunded";
  fee?: { amount: number; currency: string };
  scheduledAt: string;
}

export interface AdminAppointmentParams extends PaginationParams {
  status?: AppointmentStatus;
}

export interface AdminReport {
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  totalPsychologists: number;
  totalPatients: number;
}

export interface RefundDto {
  reason: string;
  amount?: number;
}
