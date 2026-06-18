import type { IUser } from "./user.model";

export interface UpdateUserRequest {
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  timezone?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  country: string;
  timezone: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
}

export function toUserResponse(user: IUser): UserResponse {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    age: user.age,
    gender: user.gender,
    emergencyContact: user.emergencyContact,
    country: user.country,
    timezone: user.timezone,
    avatarUrl: user.avatarUrl,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
