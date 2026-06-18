import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { crisisService } from "./crisis.service";
import { StatusCodes } from "@/constants/statusCodes.constant";

export class CrisisController {
  getResources = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const resources = await crisisService.getResources(req.query as any);
      res.status(StatusCodes.OK).json(ApiResponse.success(resources));
    }
  );
}

export const crisisController = new CrisisController();
