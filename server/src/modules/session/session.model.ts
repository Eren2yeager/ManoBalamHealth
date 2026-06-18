import { Schema, model, Document, Types } from "mongoose";

export interface ISession extends Document {
  appointmentId: Types.ObjectId;
  roomId: string;
  mode: "chat" | "audio" | "video";
  status: "not_started" | "active" | "ended";
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  psychologistNotes?: string;
  recordingUrl?: string;
}

const sessionSchema = new Schema<ISession>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    roomId: { type: String, required: true, unique: true },
    mode: { type: String, enum: ["chat", "audio", "video"], required: true },
    status: { type: String, enum: ["not_started", "active", "ended"], default: "not_started" },
    startedAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number },
    psychologistNotes: { type: String },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export const SessionModel = model<ISession>("Session", sessionSchema);
