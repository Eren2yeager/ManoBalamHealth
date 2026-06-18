import { Schema, model, Document } from "mongoose";

export interface ICrisisResource extends Document {
  name: string;
  description: string;
  phone: string;
  website?: string;
  jurisdiction: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const crisisResourceSchema = new Schema<ICrisisResource>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String },
    jurisdiction: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

crisisResourceSchema.index({ jurisdiction: 1, isActive: 1 });

export const CrisisResourceModel = model<ICrisisResource>(
  "CrisisResource",
  crisisResourceSchema
);
