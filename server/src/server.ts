import http from "http";
import { createApp } from "@/app";
import { connectDB } from "@/config/db";
import { initSocket } from "@/sockets/index";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { scheduleSlotGeneration } from "@/jobs/queues/slotGeneration.queue";
import slotGenerationWorker from "@/jobs/workers/slotGeneration.worker";
import notificationWorker from "@/jobs/workers/notification.worker";
import reminderWorker from "@/jobs/workers/reminder.worker";

const bootstrap = async () => {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.io
  initSocket(server);
  
  // Initialize background workers
  logger.info("Starting background workers...");
  slotGenerationWorker;
  notificationWorker;
  reminderWorker;

  // Schedule slot generation
  await scheduleSlotGeneration();
  logger.info("Slot generation scheduled");
  
  server.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });
};

bootstrap().catch((err) => {
  logger.error("Failed to start server", { error: err });
  process.exit(1);
});
