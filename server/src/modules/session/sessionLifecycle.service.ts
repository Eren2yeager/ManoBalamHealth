import { Server } from "socket.io";
import redis from "@/config/redis";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { isWithinSessionAccessWindow, resolveAppointmentTiming, DEFAULT_PURCHASED_DURATION_SECONDS } from "@/modules/appointment/appointmentTiming";
import { SessionModel, type ISession } from "./session.model";

const LIFECYCLE_TICK_MS = 1000;

type SessionLifecycleContext = {
  session: ISession;
  appointment: any;
  patientUserId: string;
  psychologistUserId: string;
};

type SessionLifecycleUpdate = {
  sessionId: string;
  appointmentId: string;
  status: "not_started" | "active" | "ended";
  startedAt?: string;
  activeTimingStartedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  purchasedDurationSeconds: number;
  remainingSeconds: number;
};

class SessionLifecycleService {
  private io: Server | null = null;
  private watcher: NodeJS.Timeout | null = null;

  initialize(io: Server) {
    this.io = io;

    if (this.watcher) {
      clearInterval(this.watcher);
    }

    this.watcher = setInterval(() => {
      void this.tickActiveSessions();
    }, LIFECYCLE_TICK_MS);
  }

  async reconcileSession(sessionId: string, ioOverride?: Server | null) {
    const io = ioOverride ?? this.io;
    const context = await this.getContext(sessionId);
    if (!context) return null;

    const { session, appointment, patientUserId, psychologistUserId } = context;
    const purchasedDurationSeconds = await this.ensurePurchasedDuration(session, appointment);

    if (session.status === "ended") {
      this.emitLifecycleUpdate(io, session, purchasedDurationSeconds);
      return session;
    }

    const bothParticipantsOnline = await this.areBothParticipantsOnline(
      session._id.toString(),
      patientUserId,
      psychologistUserId,
    );
    const now = new Date();
    let sessionChanged = false;
    let appointmentChanged = false;

    if (bothParticipantsOnline) {
      if (session.status === "not_started") {
        session.status = "active";
        session.startedAt = session.startedAt ?? now;
        sessionChanged = true;
      }

      if (!session.activeTimingStartedAt) {
        session.activeTimingStartedAt = now;
        sessionChanged = true;
      }

      if (appointment.status === "confirmed") {
        appointment.status = "in_progress";
        appointment.startedAt = appointment.startedAt ?? now;
        appointmentChanged = true;
      }
    } else if (session.activeTimingStartedAt) {
      session.durationSeconds = this.getElapsedSeconds(session, now, purchasedDurationSeconds);
      session.activeTimingStartedAt = undefined;
      sessionChanged = true;
    }

    const elapsedSeconds = this.getElapsedSeconds(session, now, purchasedDurationSeconds);
    if (elapsedSeconds >= purchasedDurationSeconds) {
      await this.endSession(context, now, io);
      return session;
    }

    if (sessionChanged || appointmentChanged) {
      await Promise.all([
        sessionChanged ? session.save() : Promise.resolve(),
        appointmentChanged ? appointment.save() : Promise.resolve(),
      ]);
    }

    this.emitLifecycleUpdate(io, session, purchasedDurationSeconds);
    return session;
  }

  async canUseLiveSessionFeatures(sessionId: string) {
    const context = await this.getContext(sessionId);
    if (!context) return false;

    const { session, appointment, patientUserId, psychologistUserId } = context;
    if (session.status === "ended") return false;

    const timing = await resolveAppointmentTiming(appointment);
    if (
      !isWithinSessionAccessWindow({
        scheduledAt: appointment.scheduledAt,
        purchasedDurationSeconds: timing.purchasedDurationSeconds,
      })
    ) {
      return false;
    }

    return this.areBothParticipantsOnline(
      session._id.toString(),
      patientUserId,
      psychologistUserId,
    );
  }

  getElapsedSeconds(
    session: Pick<ISession, "durationSeconds" | "activeTimingStartedAt" | "status">,
    now: Date = new Date(),
    purchasedDurationSeconds?: number,
  ) {
    const persisted = session.durationSeconds ?? 0;
    const activeDelta =
      session.status === "active" && session.activeTimingStartedAt
        ? Math.max(
            0,
            Math.floor((now.getTime() - session.activeTimingStartedAt.getTime()) / 1000),
          )
        : 0;
    const total = persisted + activeDelta;

    if (typeof purchasedDurationSeconds === "number") {
      return Math.min(total, purchasedDurationSeconds);
    }

    return total;
  }

  private async tickActiveSessions() {
    if (!this.io) return;

    const activeSessions = await SessionModel.find({ status: "active" }).select("_id");
    await Promise.all(
      activeSessions.map((session) =>
        this.reconcileSession(session._id.toString(), this.io).catch(() => null),
      ),
    );
  }

  private async endSession(
    context: SessionLifecycleContext,
    endedAt: Date,
    io: Server | null,
  ) {
    const { session, appointment } = context;
    const purchasedDurationSeconds =
      session.purchasedDurationSeconds ?? DEFAULT_PURCHASED_DURATION_SECONDS;

    session.durationSeconds = this.getElapsedSeconds(session, endedAt, purchasedDurationSeconds);
    session.activeTimingStartedAt = undefined;
    session.status = "ended";
    session.endedAt = endedAt;

    appointment.status = "completed";
    appointment.endedAt = appointment.endedAt ?? endedAt;

    await Promise.all([session.save(), appointment.save()]);

    this.emitLifecycleUpdate(io, session, purchasedDurationSeconds);
    io?.to(`session-presence:${session._id.toString()}`).emit("session:ended", {
      sessionId: session._id.toString(),
      appointmentId: appointment._id.toString(),
      endedAt: endedAt.toISOString(),
    });
    io?.to(`session:${session._id.toString()}`).emit("session:ended", {
      sessionId: session._id.toString(),
      appointmentId: appointment._id.toString(),
      endedAt: endedAt.toISOString(),
    });
    io?.to(`webrtc:${session._id.toString()}`).emit("session:ended", {
      sessionId: session._id.toString(),
      appointmentId: appointment._id.toString(),
      endedAt: endedAt.toISOString(),
    });
  }

  private emitLifecycleUpdate(
    io: Server | null,
    session: ISession,
    purchasedDurationSeconds: number,
  ) {
    if (!io) return;

    const payload: SessionLifecycleUpdate = {
      sessionId: session._id.toString(),
      appointmentId: session.appointmentId.toString(),
      status: session.status,
      startedAt: session.startedAt?.toISOString(),
      activeTimingStartedAt: session.activeTimingStartedAt?.toISOString(),
      endedAt: session.endedAt?.toISOString(),
      durationSeconds: this.getElapsedSeconds(session, new Date(), purchasedDurationSeconds),
      purchasedDurationSeconds,
      remainingSeconds: Math.max(
        0,
        purchasedDurationSeconds -
          this.getElapsedSeconds(session, new Date(), purchasedDurationSeconds),
      ),
    };

    io.to(`session-presence:${session._id.toString()}`).emit("session:lifecycle:update", payload);
    io.to(`session:${session._id.toString()}`).emit("session:lifecycle:update", payload);
    io.to(`webrtc:${session._id.toString()}`).emit("session:lifecycle:update", payload);
  }

  private async getContext(sessionId: string): Promise<SessionLifecycleContext | null> {
    const session = await SessionModel.findById(sessionId).populate("appointmentId");
    if (!session) return null;

    const appointment = await AppointmentModel.findById((session.appointmentId as any)._id)
      .populate("patientId")
      .populate("psychologistId");
    if (!appointment) return null;

    await (appointment as any).populate("psychologistId.userId");

    const appointmentAny = appointment as any;
    return {
      session,
      appointment,
      patientUserId: appointmentAny.patientId._id.toString(),
      psychologistUserId: appointmentAny.psychologistId.userId._id.toString(),
    };
  }

  private async ensurePurchasedDuration(session: ISession, appointment: any) {
    if (session.purchasedDurationSeconds && session.purchasedDurationSeconds > 0) {
      return session.purchasedDurationSeconds;
    }

    const { purchasedDurationSeconds } = await resolveAppointmentTiming(appointment);

    session.purchasedDurationSeconds = purchasedDurationSeconds;
    session.durationSeconds = session.durationSeconds ?? 0;
    await session.save();

    return purchasedDurationSeconds;
  }

  private async areBothParticipantsOnline(
    sessionId: string,
    patientUserId: string,
    psychologistUserId: string,
  ) {
    const [patientCount, psychologistCount] = await Promise.all([
      redis.scard(`session:${sessionId}:user:${patientUserId}:sockets`),
      redis.scard(`session:${sessionId}:user:${psychologistUserId}:sockets`),
    ]);

    return patientCount > 0 && psychologistCount > 0;
  }
}

export const sessionLifecycleService = new SessionLifecycleService();
