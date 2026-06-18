export interface AssessmentAnswer {
  questionId: string;
  selectedScore: number;
}

export interface SubmitAssessmentRequest {
  templateType: "anxiety" | "stress" | "depression";
  answers: AssessmentAnswer[];
}

export interface AssessmentResultResponse {
  id: string;
  templateType: "anxiety" | "stress" | "depression";
  totalScore: number;
  resultLabel: string;
  riskLevel: "low" | "moderate" | "high" | "severe";
  triggeredCrisisFlow: boolean;
  crisisResources?: Array<{
    id: string;
    name: string;
    description: string;
    phone: string;
    website?: string;
  }>;
  createdAt: string;
}
