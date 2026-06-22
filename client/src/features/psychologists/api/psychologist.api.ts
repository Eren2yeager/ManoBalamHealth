import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse, PaginationMeta } from "@/types/global.types";
import type {
  PsychologistListItem, PsychologistDetail, PsychologistListParams, UpdatePsychologistProfileDto,
  PsychologistOnboarding,
  PsychologistCredential,
} from "../types/psychologist.types";

export const listPsychologists = async (
  params: PsychologistListParams
): Promise<{ items: PsychologistListItem[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PsychologistListItem[]>>("/psychologists", { params });
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const getPsychologistById = async (id: string): Promise<PsychologistDetail> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PsychologistDetail>>(`/psychologists/${id}`);
  return data.data;
};

export const uploadCredentials = async (
  files: File[],
  type: "license" | "degree" | "id_proof"
): Promise<{ credentials: Array<{ docUrl: string; type: string; verified: boolean }> }> => {
  const form = new FormData();
  files.forEach((f) => form.append("documents", f));
  form.append("type", type);
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ credentials: PsychologistCredential[] }>>(
    "/psychologists/credentials",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};

export const updateMyPsychologistProfile = async (
  payload: UpdatePsychologistProfileDto
): Promise<PsychologistDetail> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<PsychologistDetail>>(
    "/psychologists/me/profile",
    payload
  );
  return data.data;
};

export const getMyPsychologistOnboarding = async (): Promise<PsychologistOnboarding> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<PsychologistOnboarding>>(
    "/psychologists/me/onboarding",
  );
  return data.data;
};

export const submitPsychologistForReview = async (): Promise<{
  id: string;
  onboardingStatus: "under_review";
  submittedAt: string;
}> => {
  const { data } = await axiosInstance.post<
    ApiSuccessResponse<{ id: string; onboardingStatus: "under_review"; submittedAt: string }>
  >("/psychologists/me/submit");
  return data.data;
};
