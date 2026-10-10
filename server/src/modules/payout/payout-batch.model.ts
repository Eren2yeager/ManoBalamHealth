import { Schema, model, Document, Types } from "mongoose";

export interface IPayoutBatch extends Document {
  name: string;
  description?: string;
  payoutIds: Types.ObjectId[];
  totalGrossAmount: number; // Sum of all gross amounts (in paise)
  totalCommissionAmount: number; // Sum of all commissions (in paise)
  totalNetAmount: number; // Sum of all net amounts (in paise)
  psychologistCount: number; // Number of unique psychologists in this batch
  status: "draft" | "processing" | "completed" | "failed";
  provider?: string;
  providerBatchReference?: string;
  failureReason?: string;
  createdBy: Types.ObjectId; // Admin who created the batch
  processedBy?: Types.ObjectId; // Admin who processed the batch
  processedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const payoutBatchSchema = new Schema<IPayoutBatch>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    payoutIds: {
      type: [Schema.Types.ObjectId],
      ref: "Payout",
      required: true,
    },
    totalGrossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCommissionAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalNetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    psychologistCount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "processing", "completed", "failed"],
      default: "draft",
      index: true,
    },
    provider: {
      type: String,
    },
    providerBatchReference: {
      type: String,
    },
    failureReason: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { 
    timestamps: true,
  }
);

// Index for efficient queries
payoutBatchSchema.index({ status: 1, createdAt: -1 });
payoutBatchSchema.index({ createdBy: 1 });

export const PayoutBatchModel = model<IPayoutBatch>("PayoutBatch", payoutBatchSchema);
