import { Schema, model, Document, Types } from "mongoose";

export interface IAvailabilityRule extends Document {
  psychologistId: Types.ObjectId;
  dayOfWeek: number; // 0-6
  startTime: string; // "HH:mm"
  endTime: string;
  slotDurationMinutes: number;
  modes: Array<"chat" | "audio" | "video">;
  isActive: boolean;
}

const ruleSchema = new Schema<IAvailabilityRule>(
  {
    psychologistId: { type: Schema.Types.ObjectId, ref: "PsychologistProfile", required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, enum: [30, 45, 60], required: true },
    modes: [{ type: String, enum: ["chat", "audio", "video"] }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AvailabilityRuleModel = model<IAvailabilityRule>("AvailabilityRule", ruleSchema);
