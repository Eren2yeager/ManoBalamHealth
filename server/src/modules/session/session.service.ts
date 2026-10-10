import { SessionModel } from "./session.model";
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
  UpdateSessionNotesRequest,
  UpdateSessionNotesResponse,
} from "./session.types";

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

    // Prepare ICE servers from env
    const iceServers: Array<{ urls: string; username?: string; credential?: string }> = [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: env.TURN_SERVER_URL,
        username: env.TURN_SERVER_USERNAME,
        credential: env.TURN_SERVER_CREDENTIAL,
      },
    ];

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

    // Update notes
    session.psychologistNotes = data.notes;
    await session.save();

    return {
      id: session._id.toString(),
      notesUpdated: true,
    };
  }
}

export const sessionService = new SessionService();
