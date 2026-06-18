import { create } from "zustand";

interface AuthFlowState {
  pendingUserId: string | null;
  otpSentTo: "email" | "phone" | null;
  setPendingVerification: (userId: string, sentTo: "email" | "phone") => void;
  clear: () => void;
}

export const useAuthStore = create<AuthFlowState>((set) => ({
  pendingUserId: null,
  otpSentTo: null,
  setPendingVerification: (userId, sentTo) => set({ pendingUserId: userId, otpSentTo: sentTo }),
  clear: () => set({ pendingUserId: null, otpSentTo: null }),
}));
