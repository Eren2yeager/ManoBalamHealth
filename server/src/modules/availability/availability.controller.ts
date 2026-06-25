import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { availabilityService } from "./availability.service";

class AvailabilityController {
  /**
   * Get recurring availability rules
   */
  getRules = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const rules = await availabilityService.getRules(userId);
    res.status(200).json(ApiResponse.success(rules, "Rules retrieved successfully"));
  });

  /**
   * Set recurring availability rules
   */
  setRules = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const validatedBody = req.validatedData?.body || req.body;
    const result = await availabilityService.setRules(userId, validatedBody);
    res.status(200).json(ApiResponse.success(result, "Rules updated successfully"));
  });

  /**
   * Get available slots for a psychologist
   */
  getSlots = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const psychologistId = Array.isArray(req.params.psychologistId) ? req.params.psychologistId[0] : req.params.psychologistId;
    const validatedQuery = req.validatedData?.query as any;
    const result = await availabilityService.getSlots(psychologistId, validatedQuery);
    res.status(200).json(ApiResponse.success(result, "Slots retrieved successfully"));
  });

  /**
   * Block a slot
   */
  blockSlot = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const slotId = Array.isArray(req.params.slotId) ? req.params.slotId[0] : req.params.slotId;
    const result = await availabilityService.blockSlot(slotId, userId);
    res.status(200).json(ApiResponse.success(result, "Slot blocked successfully"));
  });
}

export const availabilityController = new AvailabilityController();
