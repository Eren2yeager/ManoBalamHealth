import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  IncomingEmergencyRequest,
  EmergencyPhase,
  MatchedPsychologist,
} from "../types/emergency.types";

/**
 * Emergency store — tracks UI state driven entirely by socket events.
 * Persisted to localStorage so state survives refreshes.
 */
interface EmergencyState {
  // Patient side
  phase: EmergencyPhase;
  currentRequestId: string | null;
  concernDescription: string | null;
  requestSentAt: number | null; // timestamp
  countdownSeconds: number;
  matchedPsychologist: MatchedPsychologist | null;

  // Psychologist side
  incomingRequest: IncomingEmergencyRequest | null;
  ignoredRequestIds: string[];
  requestAlreadyTaken: boolean;

  // Actions
  setPhase: (phase: EmergencyPhase) => void;
  setCurrentRequestId: (id: string | null) => void;
  setConcernDescription: (description: string | null) => void;
  setRequestSentAt: (time: number | null) => void;
  setCountdownSeconds: (seconds: number | ((prev: number) => number)) => void;
  setMatchedPsychologist: (psychologist: MatchedPsychologist | null) => void;
  setIncomingRequest: (request: IncomingEmergencyRequest | null) => void;
  addIgnoredRequestId: (id: string) => void;
  setRequestAlreadyTaken: (taken: boolean) => void;
  reset: () => void;
}

const initialState = {
  phase: "idle" as EmergencyPhase,
  currentRequestId: null,
  concernDescription: null,
  requestSentAt: null,
  countdownSeconds: 60,
  matchedPsychologist: null,
  incomingRequest: null,
  ignoredRequestIds: [],
  requestAlreadyTaken: false,
};

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set) => ({
      ...initialState,

      setPhase: (phase) => set({ phase }),
      setCurrentRequestId: (id) => set({ currentRequestId: id }),
      setConcernDescription: (description) =>
        set({ concernDescription: description }),
      setRequestSentAt: (time) => set({ requestSentAt: time }),
      setCountdownSeconds: (seconds) =>
        set((state) => ({
          countdownSeconds:
            typeof seconds === "function"
              ? seconds(state.countdownSeconds)
              : seconds,
        })),
      setMatchedPsychologist: (psychologist) =>
        set({ matchedPsychologist: psychologist }),
      setIncomingRequest: (request) => set({ incomingRequest: request }),
      addIgnoredRequestId: (id) =>
        set((state) => ({
          ignoredRequestIds: [...state.ignoredRequestIds, id],
        })),
      setRequestAlreadyTaken: (taken) => set({ requestAlreadyTaken: taken }),
      reset: () => set(initialState),
    }),
    {
      name: "emergency-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
