import { create } from "zustand";
import type { IncomingEmergencyRequest } from "../types/emergency.types";

/**
 * Emergency store — tracks UI state driven entirely by socket events.
 * No REST API involvement; the emergency flow is socket-only per FRONTEND_PLAN.md § 6.4.
 */
interface EmergencyState {
  /** Patient side: whether we are currently waiting for a match */
  isWaiting: boolean;
  /** Patient side: countdown seconds remaining (starts at 60) */
  countdownSeconds: number;
  /** Patient side: timed out with no match */
  requestTimedOut: boolean;

  /** Psychologist side: pending incoming request (if any) */
  incomingRequest: IncomingEmergencyRequest | null;
  /** Psychologist side: request was already taken by another psychologist */
  requestAlreadyTaken: boolean;

  setIsWaiting: (waiting: boolean) => void;
  setCountdownSeconds: (seconds: number | ((prev: number) => number)) => void;
  setRequestTimedOut: (timedOut: boolean) => void;
  setIncomingRequest: (request: IncomingEmergencyRequest | null) => void;
  setRequestAlreadyTaken: (taken: boolean) => void;
  reset: () => void;
}

const initialState = {
  isWaiting: false,
  countdownSeconds: 60,
  requestTimedOut: false,
  incomingRequest: null,
  requestAlreadyTaken: false,
};

export const useEmergencyStore = create<EmergencyState>((set) => ({
  ...initialState,

  setIsWaiting: (waiting) => set({ isWaiting: waiting }),
  setCountdownSeconds: (seconds) =>
    set((state) => ({
      countdownSeconds:
        typeof seconds === "function" ? seconds(state.countdownSeconds) : seconds,
    })),
  setRequestTimedOut: (timedOut) => set({ requestTimedOut: timedOut }),
  setIncomingRequest: (request) => set({ incomingRequest: request }),
  setRequestAlreadyTaken: (taken) => set({ requestAlreadyTaken: taken }),
  reset: () => set(initialState),
}));
