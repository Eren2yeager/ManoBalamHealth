import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type { AvailabilityRuleDto, SlotItem } from "../types/availability.types";

export const getRules = async (): Promise<AvailabilityRuleDto[]> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<AvailabilityRuleDto[]>>("/availability/me/rules");
  return data.data;
};

export const setRecurringRules = async (rules: AvailabilityRuleDto[]): Promise<{ rulesUpdated: number }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ rulesUpdated: number }>>(
    "/availability/me/rules",
    { rules }
  );
  return data.data;
};

export const getSlots = async (
  psychologistId: string,
  from: string,
  to: string,
  mode?: "chat" | "audio" | "video"
): Promise<SlotItem[]> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<SlotItem[]>>(
    `/availability/${psychologistId}/slots`,
    { params: { from, to, mode } }
  );
  return data.data;
};

export const blockSlot = async (slotId: string): Promise<{ slotId: string; isBlocked: true }> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<{ slotId: string; isBlocked: true }>>(
    `/availability/slots/${slotId}/block`
  );
  return data.data;
};