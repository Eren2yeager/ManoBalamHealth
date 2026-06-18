import { Schema, model, Document, Types } from "mongoose";
import { NotificationChannel } from "./notification.types";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: "appointment_reminder" | "appointment_confirmed" | "appointment_cancelled" | "appointment_completed";
  title: string;
  body: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    channels: { type: [String], required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = model<INotification>("Notification", notificationSchema);
