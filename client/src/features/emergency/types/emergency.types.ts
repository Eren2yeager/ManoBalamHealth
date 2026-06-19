/**
 * Emergency types derived from socket event contracts in FRONTEND_PLAN.md § 6.4.
 * The emergency flow is socket-only — there is no REST API layer for triggering
 * or accepting emergency requests. All state is driven by socket events.
 */

/** Payload received on "emergency:incoming" (psychologist side) */
export interface EmergencyIncomingPayload {
  patientId: string;
  concern: string;
  requestId: string;
}

/** Payload received on "emergency:matched" (patient side) */
export interface EmergencyMatchedPayload {
  psychologistId: string;
  sessionId: string;
}

/** Payload received on "emergency:assigned" (winning psychologist side) */
export interface EmergencyAssignedPayload {
  sessionId: string;
}

/** Payload received on "emergency:already_taken" (losing psychologist side) */
export interface EmergencyAlreadyTakenPayload {
  requestId: string;
}

/** Local UI representation of a pending incoming request (psychologist side) */
export interface IncomingEmergencyRequest {
  requestId: string;
  patientId: string;
  concern: string;
  receivedAt: string; // ISO — set locally on receipt
}
