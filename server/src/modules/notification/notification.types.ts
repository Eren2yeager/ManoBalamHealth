export type NotificationChannel = "email" | "push" | "sms";

export interface NotificationData {
  userId: string;
  type: "appointment_reminder" | "appointment_confirmed" | "appointment_cancelled" | "appointment_completed";
  title: string;
  body: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
}
