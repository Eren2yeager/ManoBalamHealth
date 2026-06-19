import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse, PaginationMeta, PaginationParams } from "@/types/global.types";
import type { SubmitFeedbackDto, PsychologistFeedbackItem } from "../types/feedback.types";

export const submitFeedback = async (payload: SubmitFeedbackDto): Promise<{ id: string }> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ id: string }>>("/feedback", payload);
  return data.data;
};

export const getPsychologistFeedback = async (
  psychologistId: string,
  params: PaginationParams
): Promise<{ items: PsychologistFeedbackItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PsychologistFeedbackItem[]>>(
    `/feedback/psychologist/${psychologistId}`,
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};