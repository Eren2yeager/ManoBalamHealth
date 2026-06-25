import type { Role } from "@/types/global.types";

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  age?: number | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  emergencyContact?: { name: string; phone: string } | null;
  country: string;
  timezone: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  age?: number | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  emergencyContact?: { name: string; phone: string } | null;
  timezone?: string;
}
