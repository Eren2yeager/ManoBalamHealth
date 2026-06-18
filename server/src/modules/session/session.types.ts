export interface GetSessionResponse {
  sessionId: string;
  appointmentId: string;
  mode: "chat" | "audio" | "video";
  roomId: string;
  status: "not_started" | "active" | "ended";
  startedAt?: string;
  iceServers: Array<{
    urls: string;
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
