import type { RiskLevel } from "@/types/global.types";

export type AssessmentType = "anxiety" | "stress" | "depression";

export interface AssessmentQuestionOption {
  text: string;
  score: number;
}

export interface AssessmentQuestionItem {
  id: string;
  text: string;
  options: AssessmentQuestionOption[];
}

export interface AssessmentTemplate {
  templateId: string;
  type: AssessmentType;
  title: string;
  questions: AssessmentQuestionItem[];
}

export interface SubmitAssessmentDto {
  templateId: string;
  answers: Array<{ questionId: string; selectedScore: number }>;
}

export interface CrisisResourceItem {
  helplineName: string;
  phoneNumber: string;
  availableHours: string;
  website?: string;
}

export interface AssessmentResult {
  resultId: string;
  totalScore: number;
  riskLevel: RiskLevel;
  triggeredCrisisFlow: boolean;
  crisisResources?: CrisisResourceItem[];
}