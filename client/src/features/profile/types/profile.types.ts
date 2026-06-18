import type { Role } from "@/types/global.types";

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  country: string;
  timezone: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  timezone?: string;
}
