import { Document, model, Schema } from "mongoose";

export interface IContactRequest extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
  status: "new" | "in_progress" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const contactRequestSchema = new Schema<IContactRequest>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30 },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    consent: { type: Boolean, required: true },
    status: { type: String, enum: ["new", "in_progress", "resolved"], default: "new", index: true },
  },
  { timestamps: true },
);

contactRequestSchema.index({ createdAt: -1 });

export const ContactRequestModel = model<IContactRequest>("ContactRequest", contactRequestSchema);

