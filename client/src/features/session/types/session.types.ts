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
  iceServers: IceServer[];
}