import { Schema, model, Document, Types } from "mongoose";

export interface IAssessmentAnswer {
  questionId: string;
  selectedScore: number;
}

export interface IAssessmentResult extends Document {
  userId: Types.ObjectId;
  templateId: Types.ObjectId;
  templateType: "anxiety" | "stress" | "depression";
  answers: IAssessmentAnswer[];
  totalScore: number;
  resultLabel: string;
  riskLevel: "low" | "moderate" | "high" | "severe";
  triggeredCrisisFlow: boolean;
  createdAt: Date;
}

const assessmentAnswerSchema = new Schema<IAssessmentAnswer>({
  questionId: { type: String, required: true },
  selectedScore: { type: Number, required: true },
});

const assessmentResultSchema = new Schema<IAssessmentResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "AssessmentTemplate",
      required: true,
    },
    templateType: {
      type: String,
      enum: ["anxiety", "stress", "depression"],
      required: true,
    },
    answers: [assessmentAnswerSchema],
    totalScore: { type: Number, required: true },
    resultLabel: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high", "severe"],
      required: true,
    },
    triggeredCrisisFlow: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AssessmentResultModel = model<IAssessmentResult>(
  "AssessmentResult",
  assessmentResultSchema
);
