import { Schema, model, Document, Types } from "mongoose";

export interface IFeeHistory extends Document {
  psychologistId: Types.ObjectId;
  previousAmount: number; // Previous fee in paise (0 for initial fee)
  newAmount: number; // New fee in paise
  currency: string;
  changedBy: Types.ObjectId; // Admin who made the change
  changeReason?: string;
  createdAt: Date;
}

const feeHistorySchema = new Schema<IFeeHistory>(
  {
    psychologistId: { 
      type: Schema.Types.ObjectId, 
      ref: "PsychologistProfile", 
      required: true,
      index: true,
    },
    previousAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    newAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changeReason: {
      type: String,
      trim: true,
    },
  },
  { 
    timestamps: true,
  }
);

// Index for efficient queries
feeHistorySchema.index({ psychologistId: 1, createdAt: -1 });
feeHistorySchema.index({ changedBy: 1, createdAt: -1 });

export const FeeHistoryModel = model<IFeeHistory>("FeeHistory", feeHistorySchema);
