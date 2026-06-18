import { Queue } from "bullmq";
import redis from "@/config/redis";

export const notificationQueue = new Queue("notifications", {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
