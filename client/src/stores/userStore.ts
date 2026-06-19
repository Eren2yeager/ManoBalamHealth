import { create } from "zustand";
import type { Role } from "@/types/global.types";

interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  isVerified: boolean;
}

interface UserState {
  user: CurrentUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: CurrentUser) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));