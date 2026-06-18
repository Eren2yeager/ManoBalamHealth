import Redis from "ioredis";
import { env } from "./env";
import { logger } from "@/utils/logger";

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates if needed (adjust for production)
  },
});

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("error", (error) => {
  logger.error("Redis connection error", { metadata: { error } });
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

export default redis;
