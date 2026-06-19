import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { feedbackService } from "./feedback.service";

export class FeedbackController {
  createFeedback = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const result = await feedbackService.createFeedback(
        req.user!.userId,
        req.body
      );
      res
        .status(StatusCodes.CREATED)
        .json(ApiResponse.success(result, "Feedback submitted successfully"));
    }
  );

  getPsychologistFeedback = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const result = await feedbackService.getPsychologistFeedback(
        req.params.psychologistId as string,
        req.query as any
      );
      res
        .status(StatusCodes.OK)
        .json(ApiResponse.success(result.data, "Feedback retrieved successfully", result.meta));
    }
  );
}

export const feedbackController = new FeedbackController();
