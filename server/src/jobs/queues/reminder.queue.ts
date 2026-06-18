import { Queue } from "bullmq";
import redis from "@/config/redis";

export const reminderQueue = new Queue("appointment-reminders", {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
