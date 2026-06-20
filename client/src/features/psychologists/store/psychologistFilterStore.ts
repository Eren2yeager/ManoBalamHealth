import { create } from "zustand";
import type { Specialization } from "../constants/psychologist.constants";

export type ModalityFilter = "any" | "video" | "audio";
export type SortBy = "rating" | "experience" | "fee_asc" | "fee_desc";

interface PsychologistFilterState {
  specializations: Specialization[];
  languages: string[];
  modality: ModalityFilter;
  minRating: number;
  sortBy: SortBy;

  toggleSpecialization: (spec: Specialization) => void;
  toggleLanguage: (lang: string) => void;
  setModality: (m: ModalityFilter) => void;
  setMinRating: (r: number) => void;
  setSortBy: (s: SortBy) => void;
  resetFilters: () => void;
}

const initialState = {
  specializations: [] as Specialization[],
  languages: [] as string[],
  modality: "any" as ModalityFilter,
  minRating: 1,
  sortBy: "rating" as SortBy,
};

export const usePsychologistFilterStore = create<PsychologistFilterState>((set) => ({
  ...initialState,

  toggleSpecialization: (spec) =>
    set((s) => ({
      specializations: s.specializations.includes(spec)
        ? s.specializations.filter((x) => x !== spec)
        : [...s.specializations, spec],
    })),

  toggleLanguage: (lang) =>
    set((s) => ({
      languages: s.languages.includes(lang)
        ? s.languages.filter((x) => x !== lang)
        : [...s.languages, lang],
    })),

  setModality: (m) => set({ modality: m }),
  setMinRating: (r) => set({ minRating: r }),
  setSortBy: (s) => set({ sortBy: s }),
  resetFilters: () => set(initialState),
}));
