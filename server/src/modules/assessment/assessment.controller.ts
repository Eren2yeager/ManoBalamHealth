import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { assessmentService } from "./assessment.service";
import { StatusCodes } from "@/constants/statusCodes.constant";

export class AssessmentController {
  getTemplate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const templateType = req.params.type as "anxiety" | "stress" | "depression";
      const template = await assessmentService.getTemplate(templateType);
      res.status(StatusCodes.OK).json(ApiResponse.success(template));
    }
  );

  submitAssessment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await assessmentService.submitAssessment(
        req.user!.userId,
        req.body
      );
      res.status(StatusCodes.OK).json(ApiResponse.success(result));
    }
  );

  getUserHistory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const history = await assessmentService.getUserHistory(req.user!.userId);
      res.status(StatusCodes.OK).json(ApiResponse.success(history));
    }
  );
}

export const assessmentController = new AssessmentController();
