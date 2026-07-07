export interface GetSessionResponse {
  sessionId: string;
  appointmentId: string;
  mode: "chat" | "audio" | "video";
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
  iceServers: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
  /** Private notes — only included when the requester is the session's psychologist */
  psychologistNotes?: SessionNoteEntryDto[];
}

export interface SessionNoteEntryDto {
  id: string;
  text: string;
  emotion?: "happy" | "calm" | "neutral" | "anxious" | "sad" | "angry";
  /** Elapsed seconds into the session when the note was taken (if taken live) */
  atSeconds?: number;
  createdAt: string;
}

export interface UpdateSessionNotesRequest {
  entries: Array<Omit<SessionNoteEntryDto, "createdAt"> & { createdAt?: string }>;
}

export interface UpdateSessionNotesResponse {
  id: string;
  notesUpdated: true;
}
