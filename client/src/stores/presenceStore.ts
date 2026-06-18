import { create } from "zustand";

interface PresenceState {
  onlinePsychologistIds: Set<string>;
  setOnline: (psychologistId: string) => void;
  setOffline: (psychologistId: string) => void;
  setOnlinePsychologists: (ids: string[]) => void;
  isOnline: (psychologistId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlinePsychologistIds: new Set(),
  
  setOnline: (psychologistId) =>
    set((state) => ({
      onlinePsychologistIds: new Set(state.onlinePsychologistIds).add(psychologistId),
    })),
  
  setOffline: (psychologistId) =>
    set((state) => {
      const newSet = new Set(state.onlinePsychologistIds);
      newSet.delete(psychologistId);
      return { onlinePsychologistIds: newSet };
    }),
  
  setOnlinePsychologists: (ids) =>
    set({ onlinePsychologistIds: new Set(ids) }),
  
  isOnline: (psychologistId) => get().onlinePsychologistIds.has(psychologistId),
}));
