import { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger";

/**
 * HTTP Request Logging Middleware
 * Logs all incoming HTTP requests with method, URL, status code, and response time
 */
export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Log when the request is finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    logger.http(`${method} ${originalUrl}`, {
      metadata: {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      },
    });
  });

  next();
};
