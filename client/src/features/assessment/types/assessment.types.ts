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
  _id?: string;
  id?: string;
  type: AssessmentType;
  title: string;
  questions: AssessmentQuestionItem[];
}

export interface SubmitAssessmentDto {
  templateType: AssessmentType;
  answers: Array<{ questionId: string; selectedScore: number }>;
}

export interface CrisisResourceItem {
  id?: string;
  name?: string;
  description?: string;
  helplineName?: string;
  phoneNumber?: string;
  phone?: string;
  availableHours?: string;
  website?: string;
}

export interface AssessmentResult {
  id: string;
  templateType: AssessmentType;
  totalScore: number;
  resultLabel: string;
  riskLevel: RiskLevel;
  triggeredCrisisFlow: boolean;
  crisisResources?: CrisisResourceItem[];
  createdAt: string;
}

export interface AssessmentHistoryItem {
  id: string;
  templateType: AssessmentType;
  totalScore: number;
  resultLabel: string;
  riskLevel: RiskLevel;
  createdAt: string;
}