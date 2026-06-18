import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse, PaginationMeta } from "@/types/global.types";
import type { Psychologist, GetPsychologistsParams } from "../types/psychologist.types";

export const getPsychologists = async (
  params: GetPsychologistsParams = {}
): Promise<{ psychologists: Psychologist[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<Psychologist[]>>(
    "/psychologists",
    { params }
  );
  return {
    psychologists: data.data,
    meta: data.meta as PaginationMeta,
  };
};

export const getPsychologistById = async (id: string): Promise<Psychologist> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<Psychologist>>(
    `/psychologists/${id}`
  );
  return data.data;
};
