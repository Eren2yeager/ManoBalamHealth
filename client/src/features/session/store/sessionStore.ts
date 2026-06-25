import { create } from "zustand";
import type { SessionDetail } from "../types/session.types";

interface SessionState {
  session: SessionDetail | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: SessionDetail) => void;
  patchSession: (patch: Partial<SessionDetail>) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  isLoading: false,
  error: null,
  setSession: (session) => set({ session }),
  patchSession: (patch) =>
    set((state) => ({
      session: state.session ? { ...state.session, ...patch } : state.session,
    })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ session: null, isLoading: false, error: null }),
}));
