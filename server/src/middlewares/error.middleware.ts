import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { logger } from "@/utils/logger";
import multer from "multer";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Avatar must be smaller than 5 MB"
        : "The uploaded avatar could not be processed";
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message,
      code: ErrorCodes.VALIDATION_ERROR,
    });
  }

  logger.error("Unhandled error", { 
    error: err,
    stack: (err as Error)?.stack,
  });
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong",
    code: ErrorCodes.INTERNAL_ERROR,
  });
};
