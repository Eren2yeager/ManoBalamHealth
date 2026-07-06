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
}

export interface UpdateSessionNotesRequest {
  notes: string;
}

export interface UpdateSessionNotesResponse {
  id: string;
  notesUpdated: true;
}
