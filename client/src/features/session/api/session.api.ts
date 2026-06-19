import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type { SessionDetail } from "../types/session.types";

export const getSession = async (appointmentId: string): Promise<SessionDetail> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<SessionDetail>>(`/sessions/${appointmentId}`);
  return data.data;
};

export const updateSessionNotes = async (
  sessionId: string,
  notes: string
): Promise<{ id: string; notesUpdated: true }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ id: string; notesUpdated: true }>>(
    `/sessions/${sessionId}/notes`,
    { notes }
  );
  return data.data;
};