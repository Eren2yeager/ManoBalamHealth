import { create } from "zustand";
import type { AllocationMode, ConsultationMode, Money } from "@/types/global.types";
import type { Specialization } from "@/features/psychologists/types/psychologist.types";

interface BookingState {
  allocationMode: AllocationMode | null;
  selectedPsychologistId: string | null;
  selectedSlotId: string | null;
  preferredWindow: { from: string; to: string } | null;
  mode: ConsultationMode | null;
  specialization: Specialization | null;
  concernDescription: string;
  scheduledAt: string | null;
  assignedPsychologistId: string | null;
  assignedFee: Money | null;
  setAllocationMode: (mode: AllocationMode) => void;
  setManualSelection: (psychologistId: string, slotId: string) => void;
  setAutoSelection: (
    from: string,
    to: string,
    specialization?: Specialization | null
  ) => void;
  setMode: (mode: ConsultationMode) => void;
  setConcern: (text: string) => void;
  setAssignmentResult: (payload: {
    psychologistId: string;
    scheduledAt: string;
    fee: Money;
  }) => void;
  reset: () => void;
}

const initialState = {
  allocationMode: null as AllocationMode | null,
  selectedPsychologistId: null as string | null,
  selectedSlotId: null as string | null,
  preferredWindow: null as { from: string; to: string } | null,
  mode: null as ConsultationMode | null,
  specialization: null as Specialization | null,
  concernDescription: "",
  scheduledAt: null as string | null,
  assignedPsychologistId: null as string | null,
  assignedFee: null as Money | null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setAllocationMode: (allocationMode) =>
    set({
      allocationMode,
      ...(allocationMode === "manual"
        ? { preferredWindow: null, specialization: null }
        : { selectedPsychologistId: null, selectedSlotId: null }),
      scheduledAt: null,
      assignedPsychologistId: null,
      assignedFee: null,
    }),
  setManualSelection: (selectedPsychologistId, selectedSlotId) =>
    set({
      selectedPsychologistId,
      selectedSlotId,
      scheduledAt: null,
      assignedPsychologistId: null,
      assignedFee: null,
    }),
  setAutoSelection: (from, to, specialization) =>
    set({
      preferredWindow: { from, to },
      specialization: specialization ?? null,
      scheduledAt: null,
      assignedPsychologistId: null,
      assignedFee: null,
    }),
  setMode: (mode) => set({ mode }),
  setConcern: (concernDescription) => set({ concernDescription }),
  setAssignmentResult: ({ psychologistId, scheduledAt, fee }) =>
    set({
      assignedPsychologistId: psychologistId,
      scheduledAt,
      assignedFee: fee,
    }),
  reset: () => set(initialState),
}));
