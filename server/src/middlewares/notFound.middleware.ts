import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(
    new ApiError(
      StatusCodes.NOT_FOUND,
      ErrorCodes.NOT_FOUND,
      `Cannot ${req.method} ${req.path}`
    )
  );
};
