import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type { CreateAppointmentDto, CreateAppointmentResponse } from "../types/booking.types";

export const createAppointment = async (
  payload: CreateAppointmentDto
): Promise<CreateAppointmentResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<CreateAppointmentResponse>>(
    "/appointments",
    payload
  );
  return data.data;
};
