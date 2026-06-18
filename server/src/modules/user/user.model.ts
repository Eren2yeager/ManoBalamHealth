import { Schema, model, Document, Types } from "mongoose";
import { Role } from "@/constants/roles.constant";

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  emergencyContact?: { name: string; phone: string };
  country: string;
  timezone: string;
  isVerified: boolean;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["patient", "psychologist", "admin"], required: true },
    age: { type: Number, min: 13, max: 120 },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
    },
    country: { type: String, required: true },
    timezone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
