import type { ConsultationMode } from "@/types/global.types";

export interface IceServer {
  urls: string;
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
}
