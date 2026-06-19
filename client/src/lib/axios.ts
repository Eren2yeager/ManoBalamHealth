import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/global.types";
import { useUserStore } from "@/stores/userStore";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // sends httpOnly refresh cookie automatically
});

axiosInstance.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;
    if (error.response?.data?.code === "TOKEN_EXPIRED" && originalRequest && !isRefreshing) {
      isRefreshing = true;
      try {
        const { data } = await axiosInstance.post<{ data: { accessToken: string } }>(
          "/auth/refresh-token"
        );
        const newToken = data.data.accessToken;
        useUserStore.getState().setAccessToken(newToken);
        refreshSubscribers.forEach((cb) => cb(newToken));
        refreshSubscribers = [];
        isRefreshing = false;
        originalRequest.headers!.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        useUserStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);