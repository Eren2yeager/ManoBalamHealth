import { AppointmentModel, type IAppointment } from "./appointment.model";
import { SessionModel } from "@/modules/session/session.model";
import { resolveAppointmentTiming } from "./appointmentTiming";
import { sessionLifecycleService } from "@/modules/session/sessionLifecycle.service";

const APPOINTMENT_RECONCILIATION_INTERVAL_MS = 60 * 1000;

class AppointmentLifecycleService {
  private watcher: NodeJS.Timeout | null = null;

  initialize() {
    if (this.watcher) {
      clearInterval(this.watcher);
    }

    this.watcher = setInterval(() => {
      void this.reconcileOverdueAppointments();
    }, APPOINTMENT_RECONCILIATION_INTERVAL_MS);
  }

  async reconcileAppointment(appointmentId: string) {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) return null;

    return this.reconcileAppointmentDocument(appointment);
  }

  async reconcileAppointmentDocument(appointment: IAppointment) {
    if (!["confirmed", "in_progress"].includes(appointment.status)) {
      return appointment;
    }

    const timing = await resolveAppointmentTiming(appointment);
    const now = new Date();
    if (now < timing.scheduledEndsAt) {
      return appointment;
    }

    const session = await SessionModel.findOne({ appointmentId: appointment._id });
    const sessionConsumedSeconds = session
      ? sessionLifecycleService.getElapsedSeconds(
          session,
          timing.scheduledEndsAt,
          timing.purchasedDurationSeconds,
        )
      : 0;
    const hasConsumedTime =
      sessionConsumedSeconds > 0 || Boolean(session?.startedAt);

    if (session) {
      session.purchasedDurationSeconds =
        session.purchasedDurationSeconds ?? timing.purchasedDurationSeconds;
      session.durationSeconds = sessionConsumedSeconds;
      session.activeTimingStartedAt = undefined;
      session.endedAt = session.endedAt ?? timing.scheduledEndsAt;
      session.status = hasConsumedTime ? "ended" : "not_started";
      await session.save();
    }

    appointment.status = hasConsumedTime ? "completed" : "no_show";
    appointment.endedAt = appointment.endedAt ?? timing.scheduledEndsAt;
    await appointment.save();

    return appointment;
  }

  private async reconcileOverdueAppointments() {
    const appointments = await AppointmentModel.find({
      status: { $in: ["confirmed", "in_progress"] },
    });

    await Promise.all(
      appointments.map((appointment) =>
        this.reconcileAppointmentDocument(appointment).catch(() => null),
      ),
    );
  }
}

export const appointmentLifecycleService = new AppointmentLifecycleService();
