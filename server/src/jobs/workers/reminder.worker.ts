import { Worker } from "bullmq";
import redis from "@/config/redis";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { notificationService } from "@/modules/notification/notification.service";
import { DateTime } from "luxon";

const reminderWorker = new Worker(
  "appointment-reminders",
  async (job) => {
    const { appointmentId, reminderType } = job.data;

    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    // Get patient details
    const patient = await appointment.populate("patientId");

    const scheduledAtLocal = DateTime.fromJSDate(appointment.scheduledAt).toLocaleString(
      DateTime.DATETIME_MED
    );

    // Send reminder notification
    await notificationService.createNotification({
      userId: (appointment.patientId as any)._id.toString(),
      type: "appointment_reminder",
      title: `Reminder: Your appointment in ${reminderType}`,
      body: `You have an appointment scheduled at ${scheduledAtLocal}`,
      data: { appointmentId: appointment._id.toString() },
      channels: ["email"],
    });
  },
  { connection: redis as any }
);

export default reminderWorker;
