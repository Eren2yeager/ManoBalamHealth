import { isValidObjectId } from "mongoose";
import { SessionModel } from "@/modules/session/session.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { logger } from "@/utils/logger";

export interface SessionParticipants {
  sessionId: string;
  appointmentId: string;
  patientUserId: string;
  psychologistUserId: string;
}

// Participants of a session never change, so cache lookups briefly to avoid
// re-running 3 DB queries on every signaling packet (ICE candidates arrive in bursts).
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { value: SessionParticipants | null; expiresAt: number }>();

const evictExpired = () => {
  if (cache.size < 500) return;
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
};

export const getSessionParticipants = async (
  sessionId: string,
): Promise<SessionParticipants | null> => {
  if (typeof sessionId !== "string" || !isValidObjectId(sessionId)) return null;

  const cached = cache.get(sessionId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  let value: SessionParticipants | null = null;
  try {
    const session = await SessionModel.findById(sessionId).select("appointmentId").lean();
    if (session) {
      const appointment = await AppointmentModel.findById(session.appointmentId)
        .select("patientId psychologistId")
        .lean();
      if (appointment) {
        const psychologist = await PsychologistModel.findById(appointment.psychologistId)
          .select("userId")
          .lean();
        if (psychologist) {
          value = {
            sessionId,
            appointmentId: appointment._id.toString(),
            patientUserId: appointment.patientId.toString(),
            psychologistUserId: psychologist.userId.toString(),
          };
        }
      }
    }
  } catch (error) {
    logger.error("Failed to resolve session participants", { sessionId, error });
    return null;
  }

  evictExpired();
  cache.set(sessionId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
};

export const isSessionParticipant = async (
  sessionId: string,
  userId: string,
): Promise<boolean> => {
  const participants = await getSessionParticipants(sessionId);
  if (!participants) return false;
  return participants.patientUserId === userId || participants.psychologistUserId === userId;
};

/**
 * Wrap a socket event handler so a thrown/rejected error never becomes an
 * unhandled rejection (which can crash the process) and malformed payloads
 * are simply ignored.
 */
export const safeHandler = <T>(
  name: string,
  handler: (payload: T) => Promise<void> | void,
) => {
  return async (payload: T) => {
    try {
      await handler(payload);
    } catch (error) {
      logger.error(`Socket handler "${name}" failed`, { error });
    }
  };
};

export const extractSessionId = (payload: unknown): string | null => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const sessionId = (payload as { sessionId?: unknown }).sessionId;
    if (typeof sessionId === "string") return sessionId;
  }
  return null;
};
