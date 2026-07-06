import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse, PaginationMeta, PaginationParams } from "@/types/global.types";
import type {
  PendingPsychologistItem, VerifyPsychologistDto, AdminAppointmentItem,
  AdminAppointmentParams, AdminReport, RefundDto,
} from "../types/admin.types";

export const getPendingPsychologists = async (
  params: PaginationParams
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