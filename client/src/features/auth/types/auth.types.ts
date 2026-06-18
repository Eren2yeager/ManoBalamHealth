import type { Role } from "@/types/global.types";

export interface RegisterDto {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: "patient" | "psychologist";
  country: string;
  timezone: string;
}

export interface RegisterResponse {
  userId: string;
  email?: string;
  phone?: string;
  otpSentTo: "email" | "phone";
}

export interface VerifyOtpDto {
  userId: string;
  otp: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  isVerified: boolean;
}

export interface AuthSuccessResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginDto {
  emailOrPhone: string;
  password: string;
}
