import { Worker } from "bullmq";
import redis from "@/config/redis";
import { NotificationModel } from "@/modules/notification/notification.model";
import { sendEmail } from "@/modules/notification/channels/email.channel";
import { sendPushNotification } from "@/modules/notification/channels/push.channel";

const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { notificationId } = job.data;

    const notification = await NotificationModel.findById(notificationId);
    if (!notification) throw new Error("Notification not found");

    // Send via each channel
    for (const channel of notification.channels) {
      if (channel === "email") {
        try {
          await sendEmail(
            notification.userId.toString(),
            notification.title,
            `<p>${notification.body}</p>`
          );
        } catch (error) {
          console.error("Failed to send email notification:", error);
        }
      } else if (channel === "push") {
        try {
          await sendPushNotification(
            notification.userId.toString(),
            notification.title,
            notification.body,
            notification.data
          );
        } catch (error) {
          console.error("Failed to send push notification:", error);
        }
      } else if (channel === "sms") {
        // TODO: Implement SMS channel
        console.log("SMS channel not implemented yet");
      }
    }
  },
  { connection: redis as any }
);

export default notificationWorker;
