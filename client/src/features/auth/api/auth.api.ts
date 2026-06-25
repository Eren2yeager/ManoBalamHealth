import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type {
  RegisterDto,
  RegisterResponse,
  VerifyOtpDto,
  AuthSuccessResponse,
  LoginDto,
} from "../types/auth.types";

export const register = async (payload: RegisterDto): Promise<RegisterResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<RegisterResponse>>("/auth/register", payload);
  return data.data;
};

export const verifyOtp = async (payload: VerifyOtpDto): Promise<AuthSuccessResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<AuthSuccessResponse>>("/auth/verify-otp", payload);
  return data.data;
};

export const resendOtp = async (userId: string): Promise<void> => {
  await axiosInstance.post("/auth/resend-otp", { userId });
};

export const login = async (payload: LoginDto): Promise<AuthSuccessResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<AuthSuccessResponse>>("/auth/login", payload);
  return data.data;
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<{ accessToken: string }>>("/auth/refresh-token");
  return data.data;
};

export const logout = async (): Promise<void> => {
  await axiosInstance.post("/auth/logout");
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await axiosInstance.post("/auth/forgot-password", { email });
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  await axiosInstance.post("/auth/reset-password", { token, password });
};
