import { Schema, model, Document } from "mongoose";

export interface IAssessmentQuestion {
  id: string;
  text: string;
  options: Array<{ text: string; score: number }>;
  isHighRiskIndicator?: boolean;
}

export interface IAssessmentScoringRange {
  min: number;
  max: number;
  label: string;
  riskLevel: "low" | "moderate" | "high" | "severe";
}

export interface IAssessmentTemplate extends Document {
  type: "anxiety" | "stress" | "depression";
  title: string;
  questions: IAssessmentQuestion[];
  scoringRanges: IAssessmentScoringRange[];
  createdAt: Date;
  updatedAt: Date;
}

const assessmentQuestionSchema = new Schema<IAssessmentQuestion>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      score: { type: Number, required: true },
    },
  ],
  isHighRiskIndicator: { type: Boolean, default: false },
});

const assessmentScoringRangeSchema = new Schema<IAssessmentScoringRange>({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  label: { type: String, required: true },
  riskLevel: {
    type: String,
    enum: ["low", "moderate", "high", "severe"],
    required: true,
  },
});

const assessmentTemplateSchema = new Schema<IAssessmentTemplate>(
  {
    type: {
      type: String,
      enum: ["anxiety", "stress", "depression"],
      required: true,
    },
    title: { type: String, required: true },
    questions: [assessmentQuestionSchema],
    scoringRanges: [assessmentScoringRangeSchema],
  },
  { timestamps: true }
);

export const AssessmentTemplateModel = model<IAssessmentTemplate>(
  "AssessmentTemplate",
  assessmentTemplateSchema
);
