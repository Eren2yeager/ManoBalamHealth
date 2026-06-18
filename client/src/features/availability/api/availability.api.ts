import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type {
  RecurringAvailabilityRule,
  CreateAvailabilityRuleDto,
  AvailableSlot,
  GetSlotsParams,
} from "../types/availability.types";

export const getPsychologistAvailabilityRules = async (): Promise<
  RecurringAvailabilityRule[]
> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<RecurringAvailabilityRule[]>>(
    "/availability/rules"
  );
  return data.data;
};

export const createAvailabilityRule = async (
  payload: CreateAvailabilityRuleDto
): Promise<RecurringAvailabilityRule> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<RecurringAvailabilityRule>>(
    "/availability/rules",
    payload
  );
  return data.data;
};

export const deleteAvailabilityRule = async (ruleId: string): Promise<void> => {
  await axiosInstance.delete(`/availability/rules/${ruleId}`);
};

export const getSlots = async (
  params: GetSlotsParams
): Promise<AvailableSlot[]> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AvailableSlot[]>>(
    "/availability/slots",
    { params }
  );
  return data.data;
};
