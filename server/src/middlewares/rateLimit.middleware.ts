import rateLimit from "express-rate-limit";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 5 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again later",
    code: ErrorCodes.RATE_LIMITED,
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});
