import { create } from "zustand";
import type { ConsultationMode, Money } from "@/types/global.types";

interface AssignmentResult {
  psychologistId: string;
  scheduledAt: string;
  fee: Money;
}

interface BookingState {
  allocationMode: "manual" | "auto" | null;
  selectedPsychologistId: string | null;
  selectedSlotId: string | null;
  preferredWindow: { from: string; to: string } | null;
  mode: ConsultationMode | null;
  specialization: string | null;
  concernDescription: string;
  // Set after createAppointment resolves (for auto/matched flow)
  assignedPsychologistId: string | null;
  assignedFee: Money | null;
  scheduledAt: string | null;
  setAllocationMode: (mode: "manual" | "auto") => void;
  setSelectedPsychologist: (psychologistId: string | null) => void;
  setManualSelection: (psychologistId: string, slotId: string) => void;
  setAutoSelection: (from: string, to: string, specialization?: string) => void;
  setMode: (mode: ConsultationMode) => void;
  setConcern: (text: string) => void;
  setAssignmentResult: (result: AssignmentResult) => void;
  reset: () => void;
}

const initialState = {
  allocationMode: null,
  selectedPsychologistId: null,
  selectedSlotId: null,
  preferredWindow: null,
  mode: null,
  specialization: null,
  concernDescription: "",
  assignedPsychologistId: null,
  assignedFee: null,
  scheduledAt: null,
} as const;

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setAllocationMode: (allocationMode) =>
    set({
      allocationMode,
      selectedPsychologistId: null,
      selectedSlotId: null,
      preferredWindow: null,
      assignedPsychologistId: null,
      assignedFee: null,
      scheduledAt: null,
    }),
  setSelectedPsychologist: (selectedPsychologistId) =>
    set({
      selectedPsychologistId,
      selectedSlotId: null,
      assignedPsychologistId: null,
      assignedFee: null,
      scheduledAt: null,
    }),
  setManualSelection: (selectedPsychologistId, selectedSlotId) =>
    set({ selectedPsychologistId, selectedSlotId }),
  setAutoSelection: (from, to, specialization) =>
    set({ preferredWindow: { from, to }, specialization: specialization ?? null }),
  setMode: (mode) => set({ mode }),
  setConcern: (concernDescription) => set({ concernDescription }),
  setAssignmentResult: ({ psychologistId, scheduledAt, fee }) =>
    set({ assignedPsychologistId: psychologistId, scheduledAt, assignedFee: fee }),
  reset: () => set({ ...initialState }),
}));
