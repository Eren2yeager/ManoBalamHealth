export interface UpdatePsychologistStatusRequest {
  decision: "approved" | "rejected";
  rejectionReason?: string;
}

export interface ProcessRefundRequest {
  reason: string;
  amount?: number; // omitted = full refund
}

export interface PsychologistListItem {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  verificationStatus: "pending" | "approved" | "rejected";
  onboardingStatus: "profile_incomplete" | "documents_pending" | "under_review" | "approved" | "rejected";
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  licensedCountries: string[];
  bio: string;
  credentials: Array<{ docUrl: string; type: string; verified: boolean }>;
  submittedAt?: string;
  rejectionReason?: string;
  pendingChanges?: {
    specialization?: string[];
    languages?: string[];
    experienceYears?: number;
    consultationFee?: { amount: number; currency: string };
    bio?: string;
    licensedCountries?: string[];
  };
  changeReviewStatus?: "pending" | "approved" | "rejected";
  changeSubmittedAt?: string;
  rating: { average: number; count: number };
  createdAt: string;
}

export interface AppointmentListItem {
  id: string;
  patient: { id: string; name: string };
  psychologist: { id: string; name: string };
  mode: string;
  status: string;
  scheduledAt: string;
  allocationMode: string;
  fee: { amount: number; currency: string };
}

export interface ReportsSummary {
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  totalPsychologists: number;
  totalPatients: number;
}
