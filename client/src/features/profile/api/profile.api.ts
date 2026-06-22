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

export const uploadAvatar = async (
  file: File,
  onProgress?: (percentage: number) => void,
): Promise<{ avatarUrl: string }> => {
  const form = new FormData();
  form.append("avatar", file);
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ avatarUrl: string }>>(
    "/users/me/avatar",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
};
