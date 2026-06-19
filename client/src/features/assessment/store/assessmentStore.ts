import { create } from "zustand";
import type {
  AssessmentTemplate,
  AssessmentResult,
} from "../types/assessment.types";

interface AssessmentState {
  currentStep: number;
  answers: Record<string, number>;
  template: AssessmentTemplate | null;
  result: AssessmentResult | null;
  isLoading: boolean;
  error: string | null;

  setTemplate: (template: AssessmentTemplate) => void;
  setAnswer: (questionId: string, score: number) => void;
  setResult: (result: AssessmentResult) => void;
  setCurrentStep: (step: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  currentStep: 0,
  answers: {},
  template: null,
  result: null,
  isLoading: false,
  error: null,

  setTemplate: (template) => set({ template }),
  setAnswer: (questionId, score) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: score },
    })),
  setResult: (result) => set({ result }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentStep: 0,
      answers: {},
      template: null,
      result: null,
      isLoading: false,
      error: null,
    }),
}));
