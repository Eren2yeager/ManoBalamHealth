import type { ConsultationMode } from "@/types/global.types";

export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface SessionDetail {
  sessionId: string;
  appointmentId: string;
  mode: ConsultationMode;
  roomId: string;
  status: "not_started" | "active" | "ended";
  startedAt?: string;
  activeTimingStartedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  purchasedDurationSeconds: number;
  remainingSeconds: number;
  participants: {
    patientUserId: string;
    psychologistUserId: string;
    patientOnline: boolean;
    psychologistOnline: boolean;
  };
  iceServers: IceServer[];
  /** Private notes — only present when the viewer is the session's psychologist */
  psychologistNotes?: SessionNoteEntry[];
}

export type SessionNoteEmotion =
  | "happy"
  | "calm"
  | "neutral"
  | "anxious"
  | "sad"
  | "angry";

export interface SessionNoteEntry {
  id: string;
  text: string;
  emotion?: SessionNoteEmotion;
  /** Elapsed seconds into the session when the note was taken (if taken live) */
  atSeconds?: number;
  createdAt: string;
}
