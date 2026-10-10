import { ISession, SessionModel } from "./session.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { env } from "@/config/env";
import redis from "@/config/redis";
import { sessionLifecycleService } from "./sessionLifecycle.service";
import {
  GetSessionResponse,
  SessionNoteEntryDto,
  UpdateSessionNotesRequest,
  UpdateSessionNotesResponse,
} from "./session.types";

type IceServer = { urls: string | string[]; username?: string; credential?: string };

const ICE_SERVERS_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedIceServers: IceServer[] | null = null;
let cachedIceServersAt = 0;

/**
 * Fetch TURN/STUN credentials from the Metered API. Credentials are
 * short-lived, so results are cached only briefly; on failure we fall
 * back to a public STUN server so calls can still connect when both
 * peers are reachable directly.
 */
async function getIceServers(): Promise<IceServer[]> {
  const now = Date.now();
  if (cachedIceServers && now - cachedIceServersAt < ICE_SERVERS_CACHE_TTL_MS) {
    return cachedIceServers;
  }
  try {
    const response = await fetch(env.METERED_TURN_CREDENTIALS_URL);
    if (!response.ok) {
      throw new Error(`Metered TURN credentials request failed: ${response.status}`);
    }
    const iceServers = (await response.json()) as IceServer[];
    cachedIceServers = iceServers;
    cachedIceServersAt = now;
    return iceServers;
  } catch (error) {
    console.error("Failed to fetch TURN credentials, falling back to STUN only:", error);
    return [{ urls: "stun:stun.l.google.com:19302" }];
  }
}

class SessionService {
  /**
   * Get or create session by appointment ID
   */
  async getSessionByAppointmentId(
    appointmentId: string,
    userId: string,
    userRole: string
  ): Promise<GetSessionResponse> {
    // Get appointment
    const appointment = await AppointmentModel.findById(appointmentId)
      .populate("patientId")
      .populate("psychologistId");

    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    await (appointment as any).populate("psychologistId.userId");

    // Check if user is authorized
    const apptAny = appointment as any;
    const isAuthorized =
      userRole === "admin" ||
      apptAny.patientId._id.toString() === userId ||
      apptAny.psychologistId.userId._id.toString() === userId;

    if (!isAuthorized) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "You are not authorized to view this session");
    }

    // Check if appointment is confirmed
    if (
      appointment.status !== "confirmed" &&
      appointment.status !== "in_progress" &&
      appointment.status !== "completed"
    ) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "Session is not available for this appointment");
    }

    // Get or create session
    let session = await SessionModel.findOne({ appointmentId: appointment._id });

    if (!session) {
      // Create a new session
      session = await SessionModel.create({
        appointmentId: appointment._id,
        roomId: `room-${appointment._id.toString()}`,
        mode: appointment.mode,
        status: "not_started",
        durationSeconds: 0,
      });
    }

    await sessionLifecycleService.reconcileSession(session._id.toString(), null);
    session = await SessionModel.findById(session._id);
    if (!session) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Session not found");
    }

    // Fetch ICE servers (STUN + TURN) from the Metered API
    const iceServers = await getIceServers();

    const patientUserId = apptAny.patientId._id.toString();
    const psychologistUserId = apptAny.psychologistId.userId._id.toString();
    const [patientSocketCount, psychologistSocketCount] = await Promise.all([
      redis.scard(`session:${session._id.toString()}:user:${patientUserId}:sockets`),
      redis.scard(`session:${session._id.toString()}:user:${psychologistUserId}:sockets`),
    ]);
    const currentDurationSeconds = sessionLifecycleService.getElapsedSeconds(
      session,
      new Date(),
      session.purchasedDurationSeconds,
    );

    // Build response
    return {
      sessionId: session._id.toString(),
      appointmentId: session.appointmentId.toString(),
      mode: session.mode,
      roomId: session.roomId,
      status: session.status,
      startedAt: session.startedAt?.toISOString(),
      activeTimingStartedAt: session.activeTimingStartedAt?.toISOString(),
      endedAt: session.endedAt?.toISOString(),
      durationSeconds: currentDurationSeconds,
      purchasedDurationSeconds: session.purchasedDurationSeconds ?? 0,
      remainingSeconds: Math.max(
        0,
        (session.purchasedDurationSeconds ?? 0) - currentDurationSeconds,
      ),
      participants: {
        patientUserId,
        psychologistUserId,
        patientOnline: patientSocketCount > 0,
        psychologistOnline: psychologistSocketCount > 0,
      },
      iceServers,
      ...(userId === psychologistUserId
        ? { psychologistNotes: buildNoteEntries(session) }
        : {}),
    };
  }

  /**
   * Update session notes (psychologist only)
   */
  async updateSessionNotes(
    sessionId: string,
    userId: string,
    data: UpdateSessionNotesRequest
  ): Promise<UpdateSessionNotesResponse> {
    // Get session
    const session = await SessionModel.findById(sessionId).populate("appointmentId");
    if (!session) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Session not found");
    }

    // Get psychologist profile
    const psychologist = await PsychologistModel.findOne({ userId });
    if (!psychologist) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "Only psychologists can update session notes");
    }

    // Check if psychologist owns this session's appointment
    const appointment = session.appointmentId as any;
    if (appointment.psychologistId.toString() !== psychologist._id.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "You are not authorized to update notes for this session");
    }

    // Replace the structured note entries wholesale (the client always sends
    // the full list). Once entries exist they supersede the legacy string.
    session.psychologistNoteEntries = data.entries.map((entry) => ({
      id: entry.id,
      text: entry.text,
      emotion: entry.emotion,
      atSeconds: entry.atSeconds,
      createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
    }));
    session.psychologistNotes = undefined;
    await session.save();

    return {
      id: session._id.toString(),
      notesUpdated: true,
    };
  }
}

/**
 * Structured note entries for a session; legacy free-text notes (saved before
 * structured entries existed) are folded in as a single entry.
 */
function buildNoteEntries(session: ISession): SessionNoteEntryDto[] {
  if (session.psychologistNoteEntries?.length) {
    return session.psychologistNoteEntries.map((entry) => ({
      id: entry.id,
      text: entry.text,
      emotion: entry.emotion,
      atSeconds: entry.atSeconds,
      createdAt: entry.createdAt.toISOString(),
    }));
  }
  if (session.psychologistNotes) {
    return [
      {
        id: "legacy",
        text: session.psychologistNotes,
        createdAt: (session as any).updatedAt?.toISOString?.() ?? new Date(0).toISOString(),
      },
    ];
  }
  return [];
}

export const sessionService = new SessionService();
