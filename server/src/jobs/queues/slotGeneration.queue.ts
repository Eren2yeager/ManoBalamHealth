import { Queue } from "bullmq";
import redis from "@/config/redis";

export const slotGenerationQueue = new Queue("slot-generation", {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

// Schedule daily slot generation at midnight UTC
export const scheduleSlotGeneration = async () => {
  await slotGenerationQueue.add("generate-slots", {}, { repeat: { pattern: "0 0 * * *", tz: "UTC" } });
};
