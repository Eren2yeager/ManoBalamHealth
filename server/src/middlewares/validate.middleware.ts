import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";

type ValidationTarget = "body" | "query" | "params";

export const validate = (schema: ZodType, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR,
          "Validation failed",
          result.error.issues
        )
      );
    }
    // Instead of modifying req[target] directly (which doesn't work for req.query/params)
    // We'll attach it to req.validatedData and also make a shallow copy for req.body
    if (target === "body") {
      req.body = result.data;
    }
    // Attach all validated data to req.validatedData for easy access
    req.validatedData = {
      ...(req.validatedData || {}),
      [target]: result.data
    };
    next();
  };
