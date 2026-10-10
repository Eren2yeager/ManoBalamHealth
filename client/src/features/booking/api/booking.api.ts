import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type { BookingSettings, CreateAppointmentDto, CreateAppointmentResponse } from "../types/booking.types";

export const getBookingSettings = async (): Promise<BookingSettings> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<BookingSettings>>(
    "/appointments/booking-settings",
  );
  return data.data;
};

export const createAppointment = async (
  payload: CreateAppointmentDto
): Promise<CreateAppointmentResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<CreateAppointmentResponse>>(
    "/appointments",
    payload
  );
  return data.data;
};
