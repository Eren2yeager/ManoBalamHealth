import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type { UserProfile, UpdateProfileDto } from "../types/profile.types";

export const getMe = async (): Promise<UserProfile> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<UserProfile>>("/users/me");
  return data.data;
};

export const updateMe = async (payload: UpdateProfileDto): Promise<UserProfile> => {
  const { data } = await axiosInstance.patch<ApiSuccessResponse<UserProfile>>("/users/me", payload);
  return data.data;
};

export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ avatarUrl: string }>>(
    "/users/me/avatar",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};
