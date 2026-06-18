import { create } from "zustand";
import type { Specialization } from "../types/psychologist.types";

interface PsychologistFilterState {
  specialization: Specialization | undefined;
  searchQuery: string;
  setSpecialization: (spec: Specialization | undefined) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const initialState: Pick<PsychologistFilterState, "specialization" | "searchQuery"> = {
  specialization: undefined,
  searchQuery: "",
};

export const usePsychologistFilterStore = create<PsychologistFilterState>((set) => ({
  ...initialState,
  setSpecialization: (spec) => set({ specialization: spec }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetFilters: () => set(initialState),
}));
