import { Schema, model, Document, Types } from "mongoose";

export interface IPsychologistCredential {
  _id: Types.ObjectId;
  docUrl: string;
  type: string;
  verified: boolean;
  uploadedAt: Date;
}

/** Editable professional fields held for admin review while the live profile keeps serving. */
export interface IPsychologistPendingChanges {
  specialization?: string[];
  languages?: string[];
  experienceYears?: number;
  consultationFee?: { amount: number; currency: string };
  bio?: string;
  licensedCountries?: string[];
}

export interface IPsychologistProfile extends Document {
  userId: Types.ObjectId;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  bio: string;
  credentials: Types.DocumentArray<IPsychologistCredential>;
  licensedCountries: string[];
  pendingChanges?: IPsychologistPendingChanges;
  changeReviewStatus?: "pending" | "approved" | "rejected";
  changeRejectionReason?: string;
  changeSubmittedAt?: Date;
  verificationStatus: "pending" | "approved" | "rejected";
  onboardingStatus:
    | "profile_incomplete"
    | "documents_pending"
    | "under_review"
    | "approved"
    | "rejected";
  rejectionReason?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  rating: { average: number; count: number };
  isOnline: boolean;
  /** Availability the psychologist chose via the toggle; restored on reconnect. */
  presenceIntendedOnline: boolean;
  isAcceptingEmergency: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const psychologistSchema = new Schema<IPsychologistProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: [{ type: String }],
    languages: [{ type: String }],
    experienceYears: { type: Number, default: 0, min: 0 },
    consultationFee: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: "INR" },
    },
    bio: { type: String, default: "" },
    credentials: [
      {
        docUrl: { type: String, required: true },
        type: { type: String, enum: ["license", "degree", "id_proof"], required: true },
        verified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    licensedCountries: [{ type: String }],
    pendingChanges: {
      type: new Schema(
        {
          specialization: { type: [String], default: undefined },
          languages: { type: [String], default: undefined },
          experienceYears: { type: Number },
          consultationFee: {
            type: new Schema(
              {
                amount: { type: Number, min: 0 },
                currency: { type: String },
              },
              { _id: false },
            ),
            default: undefined,
          },
          bio: { type: String },
          licensedCountries: { type: [String], default: undefined },
        },
        { _id: false },
      ),
      default: undefined,
    },
    changeReviewStatus: { type: String, enum: ["pending", "approved", "rejected"] },
    changeRejectionReason: { type: String },
    changeSubmittedAt: { type: Date },
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    onboardingStatus: {
      type: String,
      enum: ["profile_incomplete", "documents_pending", "under_review", "approved", "rejected"],
      default: "profile_incomplete",
      index: true,
    },
    rejectionReason: { type: String },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isOnline: { type: Boolean, default: false },
    presenceIntendedOnline: { type: Boolean, default: false },
    isAcceptingEmergency: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PsychologistModel = model<IPsychologistProfile>("PsychologistProfile", psychologistSchema);
