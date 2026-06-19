import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type { AssessmentTemplate, SubmitAssessmentDto, AssessmentResult, AssessmentType } from "../types/assessment.types";

export const getAssessmentTemplate = async (type: AssessmentType): Promise<AssessmentTemplate> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AssessmentTemplate>>(
    `/assessments/templates/${type}`
  );
  return data.data;
};

export const submitAssessment = async (payload: SubmitAssessmentDto): Promise<AssessmentResult> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<AssessmentResult>>(
    "/assessments/submit",
    payload
  );
  return data.data;
};