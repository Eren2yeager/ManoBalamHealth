/**
 * Emergency types derived from socket event contracts in backend
 */

// Backend sends this to psychologists when a patient requests emergency
export interface EmergencyIncomingPayload {
  requestId: string;
  patient: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  concernDescription?: string;
}

// Backend sends this to patient when a psychologist accepts
export interface EmergencyAcceptPayload {
  requestId: string;
  psychologist: {
    id: string;
    userId: string;
    name: string;
    avatarUrl?: string;
    specialization: string[];
    languages: string[];
    experienceYears: number;
    consultationFee: { amount: number; currency: string };
    rating: { average: number; count: number };
    bio: string;
    isOnline: boolean;
  };
  appointmentId: string;
}

// Backend sends this when a request is already taken
export interface EmergencyAlreadyTakenPayload {
  requestId: string;
}

// Local UI representation of a pending incoming request (psychologist side)
export interface IncomingEmergencyRequest {
  requestId: string;
  patientId: string; // backward compatible but now we have patient object
  patientName?: string;
  patientAvatarUrl?: string;
  concern?: string; // backward compatible, maps to concernDescription
  concernDescription?: string;
  receivedAt: string;
}

// Emergency state phases
export type EmergencyPhase = "idle" | "requesting" | "waiting" | "matched_waiting_confirm" | "session_ready";

// Matched psychologist info
export interface MatchedPsychologist {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  specialization: string[];
  languages: string[];
  experienceYears: number;
  consultationFee: { amount: number; currency: string };
  rating: { average: number; count: number };
  bio: string;
  isOnline: boolean;
  appointmentId: string;
}
