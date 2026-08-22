import { Schema, model, Document, Types } from "mongoose";

export interface IPayoutDetails extends Document {
  psychologistId: Types.ObjectId;
  accountHolderName: string;
  bankName: string;
  accountNumber: string; // Encrypted at rest
  accountNumberLast4: string; // Last 4 digits for display/masking
  ifscCode: string;
  accountType: "savings" | "current";
  branchName?: string;
  upiId?: string;
  status: "not_added" | "saved" | "needs_update" | "under_review";
  lastUpdatedBy?: Types.ObjectId; // Admin who last reviewed/updated
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const payoutDetailsSchema = new Schema<IPayoutDetails>(
  {
    psychologistId: { 
      type: Schema.Types.ObjectId, 
      ref: "PsychologistProfile", 
      required: true, 
      unique: true 
    },
    accountHolderName: { 
      type: String, 
      required: true,
      trim: true,
    },
    bankName: { 
      type: String, 
      required: true,
      trim: true,
    },
    accountNumber: { 
      type: String, 
      required: true,
      // This field stores encrypted data - never return this in API responses
    },
    accountNumberLast4: {
      type: String,
      required: true,
      length: 4,
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    },
    accountType: {
      type: String,
      enum: ["savings", "current"],
      required: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    upiId: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
    },
    status: {
      type: String,
      enum: ["not_added", "saved", "needs_update", "under_review"],
      default: "saved",
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastReviewedAt: {
      type: Date,
    },
  },
  { 
    timestamps: true,
  }
);

// Index for efficient queries
payoutDetailsSchema.index({ psychologistId: 1 });
payoutDetailsSchema.index({ status: 1 });

export const PayoutDetailsModel = model<IPayoutDetails>("PayoutDetails", payoutDetailsSchema);
