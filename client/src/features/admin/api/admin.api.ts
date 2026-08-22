import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse, PaginationMeta, PaginationParams } from "@/types/global.types";
import type {
  PendingPsychologistItem, VerifyPsychologistDto, AdminAppointmentItem,
  AdminAppointmentParams, AdminReport, RefundDto,
} from "../types/admin.types";

export const getPendingPsychologists = async (
  params: PaginationParams & { status?: "pending" | "approved" | "rejected" }
): Promise<{ items: PendingPsychologistItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PendingPsychologistItem[]>>(
    "/admin/psychologists/pending",
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const verifyPsychologist = async (
  id: string,
  payload: VerifyPsychologistDto
): Promise<{ id: string; verificationStatus: "approved" | "rejected" }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ id: string; verificationStatus: "approved" | "rejected" }>>(
    `/admin/psychologists/${id}/verify`,
    payload
  );
  return data.data;
};

export const reviewPsychologistChanges = async (
  id: string,
  payload: VerifyPsychologistDto
): Promise<{ id: string; changeReviewStatus: "approved" | "rejected" }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ id: string; changeReviewStatus: "approved" | "rejected" }>>(
    `/admin/psychologists/${id}/changes`,
    payload
  );
  return data.data;
};

export const getAdminAppointments = async (
  params: AdminAppointmentParams
): Promise<{ items: AdminAppointmentItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AdminAppointmentItem[]>>(
    "/admin/appointments",
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const getAdminReports = async (from: string, to: string): Promise<AdminReport> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AdminReport>>(
    "/admin/reports",
    { params: { from, to } }
  );
  return data.data;
};

export const refundPayment = async (
  paymentId: string,
  payload: RefundDto
): Promise<{ paymentId: string; status: "refunded"; refundedAmount: number }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ paymentId: string; status: "refunded"; refundedAmount: number }>>(
    `/admin/payments/${paymentId}/refund`,
    payload
  );
  return data.data;
};

export interface AdminUserItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "patient" | "psychologist";
  country: string;
  timezone: string;
  isVerified: boolean;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  appointmentCount: number;
  psychologist?: {
    onboardingStatus: "profile_incomplete" | "documents_pending" | "under_review" | "approved" | "rejected";
    verificationStatus: "pending" | "approved" | "rejected";
    consultationFee: { amount: number; currency: string };
  };
}

export const getAdminUsers = async (params: PaginationParams & { role?: "patient" | "psychologist"; status?: "active" | "inactive"; search?: string }) => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AdminUserItem[]>>("/admin/users", { params });
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const updateAdminUserActivity = async (id: string, payload: { isActive: boolean; reason: string }) => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ id: string; isActive: boolean }>>(`/admin/users/${id}/activity`, payload);
  return data.data;
};

export interface AdminUserDetail extends AdminUserItem {
  age?: number;
  gender?: string;
  updatedAt: string;
  emergencyContact?: { name: string; phone: string };
  psychologist?: AdminUserItem["psychologist"] & { specialization: string[]; languages: string[]; experienceYears: number; bio: string; licensedCountries: string[]; rating: { average: number; count: number }; isOnline: boolean };
  appointments: Array<{ id: string; scheduledAt: string; status: string; mode: string; patient: { id: string; name: string; avatarUrl?: string }; psychologist: { id: string; name: string; avatarUrl?: string } }>;
}

export const getAdminUser = async (id: string): Promise<AdminUserDetail> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AdminUserDetail>>(`/admin/users/${id}`);
  return data.data;
};

export interface SetPsychologistFeeDto {
  amount: number;
  currency: string;
  reason?: string;
}

export const setPsychologistFee = async (
  psychologistId: string,
  payload: SetPsychologistFeeDto
): Promise<{ id: string; consultationFee: { amount: number; currency: string }; previousAmount: number; newAmount: number }> => {
  const { data } = await axiosInstance.put<ApiSuccessResponse<{ id: string; consultationFee: { amount: number; currency: string }; previousAmount: number; newAmount: number }>>(
    `/psychologists/${psychologistId}/fee`,
    payload
  );
  return data.data;
};

export const getPsychologistFeeHistory = async (
  psychologistId: string,
  params: { page?: number; limit?: number }
): Promise<{ data: Array<{ id: string; previousAmount: number; newAmount: number; currency: string; changedBy: string; changedById: string; changeReason?: string; createdAt: string }>; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<Array<{ id: string; previousAmount: number; newAmount: number; currency: string; changedBy: string; changedById: string; changeReason?: string; createdAt: string }>>>(
    `/psychologists/${psychologistId}/fee-history`,
    { params }
  );
  return { data: data.data, meta: data.meta as PaginationMeta };
};

export interface PayoutReadinessItem {
  psychologistId: string;
  psychologistName: string;
  bankDetailStatus: "not_added" | "saved" | "needs_update" | "under_review";
  maskedAccountNumber: string;
  completedSessionCount: number;
  eligibleAppointmentIds: string[];
  eligibleAmount: number;
  paidAmount: number;
  outstandingBalance: number;
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

export const getPayoutReadiness = async (): Promise<PayoutReadinessResponse> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PayoutReadinessItem[]>>(
    "/payouts/readiness"
  );
  return {
    data: data.data,
    meta: data.meta as PayoutReadinessResponse["meta"],
  };
};

export interface CreatePayoutDto {
  psychologistId: string;
  appointmentIds: string[];
  commissionRate?: number;
}

export const createPayout = async (
  payload: CreatePayoutDto
): Promise<{ id: string; psychologistId: string; coveredAppointments: Array<{ appointmentId: string; amount: number }>; grossAmount: number; commissionAmount: number; netAmount: number; status: string }> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ id: string; psychologistId: string; coveredAppointments: Array<{ appointmentId: string; amount: number }>; grossAmount: number; commissionAmount: number; netAmount: number; status: string }>>(
    "/payouts",
    payload
  );
  return data.data;
};

export interface PayoutItem {
  id: string;
  psychologistId: string;
  psychologistName: string;
  coveredAppointments: Array<{ appointmentId: string; amount: number }>;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: "eligible" | "processing" | "paid" | "failed" | "on_hold";
  provider?: string;
  providerReference?: string;
  manualPaymentMethod?: "bank_transfer" | "upi";
  failureReason?: string;
  processedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export const getPayouts = async (
  params: { page?: number; limit?: number; psychologistId?: string; status?: string; startDate?: string; endDate?: string }
): Promise<{ data: PayoutItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PayoutItem[]>>(
    "/payouts",
    { params }
  );
  return { data: data.data, meta: data.meta as PaginationMeta };
};

export interface ManualPayoutInstructions {
  payoutId: string;
  psychologistId: string;
  psychologistName: string;
  amount: number;
  currency: "INR";
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "savings" | "current";
  branchName?: string;
  upiId?: string;
}

export const getManualPayoutInstructions = async (payoutId: string): Promise<ManualPayoutInstructions> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<ManualPayoutInstructions>>(
    `/payouts/${payoutId}/manual-instructions`,
  );
  return data.data;
};

export const completeManualPayout = async (
  payoutId: string,
  payload: { paymentMethod: "bank_transfer" | "upi"; transactionReference: string },
): Promise<PayoutItem> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<PayoutItem>>(
    `/payouts/${payoutId}/manual-completion`,
    payload,
  );
  return data.data;
};
