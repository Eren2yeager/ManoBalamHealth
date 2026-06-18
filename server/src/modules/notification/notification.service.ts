import { NotificationModel } from "./notification.model";
import { NotificationData } from "./notification.types";
import { notificationQueue } from "@/jobs/queues/notification.queue";

export class NotificationService {
  /**
   * Creates a notification and queues it for delivery
   */
  async createNotification(data: NotificationData) {
    // Create notification in database
    const notification = await NotificationModel.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data,
      channels: data.channels,
    });

    // Queue for delivery
    await notificationQueue.add("send-notification", {
      notificationId: notification._id.toString(),
    });

    return notification;
  }
}

export const notificationService = new NotificationService();
