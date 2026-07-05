import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse, PaginationMeta, PaginationParams } from "@/types/global.types";
import type { ChatMessage } from "../types/chat.types";

export const getChatHistory = async (
  sessionId: string,
  params: PaginationParams
): Promise<{ items: ChatMessage[]; meta: PaginationMeta }> => {
  const { data } = await axiosInstance.get<ApiSuccessResponse<ChatMessage[]>>(
    `/chat/${sessionId}/history`,
    { params }
  );
  return { items: data.data, meta: data.meta as PaginationMeta };
};

export const uploadChatAttachment = async (
  sessionId: string,
  file: File
): Promise<{ url: string; mimeType: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post<
    ApiSuccessResponse<{ url: string; mimeType: string }>
  >(`/chat/${sessionId}/attachment`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};