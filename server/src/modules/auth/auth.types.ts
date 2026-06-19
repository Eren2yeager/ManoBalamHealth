import { Role } from "@/constants/roles.constant";

export interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: Exclude<Role, "admin">;
  country: string;
  timezone: string;
}

export interface RegisterResponse {
  userId: string;
  email?: string;
  phone?: string;
  otpSentTo: "email" | "phone";
}

export interface VerifyOtpRequest {
  userId: string;
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: Role;
    isVerified: boolean;
  };
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role: Role;
    isVerified: boolean;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
}
