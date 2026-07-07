import { Schema, model, Document, Types } from "mongoose";

export const SESSION_NOTE_EMOTIONS = [
  "happy",
  "calm",
  "neutral",
  "anxious",
  "sad",
  "angry",
] as const;
export type SessionNoteEmotion = (typeof SESSION_NOTE_EMOTIONS)[number];

export interface ISessionNoteEntry {
  id: string;
  text: string;
  emotion?: SessionNoteEmotion;
  /** Elapsed seconds into the session when the note was taken (if taken live) */
  atSeconds?: number;
  createdAt: Date;
}

export interface ISession extends Document {
  appointmentId: Types.ObjectId;
  roomId: string;
  mode: "chat" | "audio" | "video";
  status: "not_started" | "active" | "ended";
  purchasedDurationSeconds?: number;
  startedAt?: Date;
  activeTimingStartedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  /** Legacy free-text notes (pre-structured-entries); folded into entries on read */
  psychologistNotes?: string;
  psychologistNoteEntries?: ISessionNoteEntry[];
  recordingUrl?: string;
}

const sessionNoteEntrySchema = new Schema<ISessionNoteEntry>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    emotion: { type: String, enum: SESSION_NOTE_EMOTIONS },
    atSeconds: { type: Number, min: 0 },
    createdAt: { type: Date, required: true },
  },
  { _id: false }
);

const sessionSchema = new Schema<ISession>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    roomId: { type: String, required: true, unique: true },
    mode: { type: String, enum: ["chat", "audio", "video"], required: true },
    status: { type: String, enum: ["not_started", "active", "ended"], default: "not_started" },
    purchasedDurationSeconds: { type: Number },
    startedAt: { type: Date },
    activeTimingStartedAt: { type: Date },
    endedAt: { type: Date },
    durationSeconds: { type: Number },
    psychologistNotes: { type: String },
    psychologistNoteEntries: { type: [sessionNoteEntrySchema], default: undefined },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export const SessionModel = model<ISession>("Session", sessionSchema);
