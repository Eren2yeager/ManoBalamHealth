import { Schema, model, Document, Types } from "mongoose";

export interface IAvailabilitySlot extends Document {
  psychologistId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  mode: "chat" | "audio" | "video";
  isBooked: boolean;
  isBlocked: boolean;
  holdExpiresAt?: Date; // set when reserved pending payment
}

const slotSchema = new Schema<IAvailabilitySlot>(
  {
    psychologistId: { type: Schema.Types.ObjectId, ref: "PsychologistProfile", required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    mode: { type: String, enum: ["chat", "audio", "video"], required: true },
    isBooked: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    holdExpiresAt: { type: Date },
  },
  { timestamps: true }
);

slotSchema.index({ psychologistId: 1, startTime: 1 });

export const AvailabilitySlotModel = model<IAvailabilitySlot>("AvailabilitySlot", slotSchema);
