import Razorpay from "razorpay";
import { env } from "./env";
import { logger } from "@/utils/logger";

export const razorpayClient = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

logger.info("Razorpay client initialized successfully");
