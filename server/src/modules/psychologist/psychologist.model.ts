import { Schema, model, Document, Types } from "mongoose";

export interface IPsychologistProfile extends Document {
  userId: Types.ObjectId;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  bio: string;
  credentials: Array<{ docUrl: string; type: string; verified: boolean }>;
  licensedCountries: string[];
  verificationStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  rating: { average: number; count: number };
  isOnline: boolean;
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
      },
    ],
    licensedCountries: [{ type: String }],
    verificationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isOnline: { type: Boolean, default: false },
    isAcceptingEmergency: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PsychologistModel = model<IPsychologistProfile>("PsychologistProfile", psychologistSchema);
