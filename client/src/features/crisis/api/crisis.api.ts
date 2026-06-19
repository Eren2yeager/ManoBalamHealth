import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type { CrisisResource } from "../types/crisis.types";

export const getCrisisResources = async (country: string): Promise<CrisisResource[]> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<CrisisResource[]>>(
    "/crisis/resources",
    { params: { country } }
  );
  return data.data;
};