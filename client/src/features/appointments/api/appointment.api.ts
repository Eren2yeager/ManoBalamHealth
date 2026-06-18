import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse, PaginationMeta } from "@/types/global.types";
import type {
  AppointmentDetail,
  AppointmentListItem,
  AppointmentListParams,
} from "../types/appointment.types";

export const getMyAppointments = async (
  params: AppointmentListParams
): Promise<{ items: AppointmentListItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AppointmentListItem[]>>(
    "/appointments/me",
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const getAppointmentById = async (id: string): Promise<AppointmentDetail> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AppointmentDetail>>(
    `/appointments/${id}`
  );
  return data.data;
};

export const cancelAppointment = async (
  id: string,
  reason?: string
): Promise<{ id: string; status: "cancelled" }> => {
  const { data } = await axiosInstance.patch<
    ApiSuccessResponse<{ id: string; status: "cancelled" }>
  >(`/appointments/${id}/cancel`, { reason });
  return data.data;
};
