import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { payoutDetailsService } from "./payout-details.service";

export class PayoutDetailsController {
  createPayoutDetails = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId as string;
    const result = await payoutDetailsService.createPayoutDetails(userId, req.body);
    res.status(201).json(ApiResponse.success(result, "Payout details created successfully"));
  });

  updatePayoutDetails = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId as string;
    const result = await payoutDetailsService.updatePayoutDetails(userId, req.body);
    res.status(200).json(ApiResponse.success(result, "Payout details updated successfully"));
  });

  getMyPayoutDetails = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.userId as string;
    const result = await payoutDetailsService.getMyPayoutDetails(userId);
    
    if (!result) {
      res.status(200).json(ApiResponse.success(null, "No payout details found"));
    } else {
      res.status(200).json(ApiResponse.success(result, "Payout details retrieved successfully"));
    }
  });

  // Admin-only endpoints
  getPayoutDetailsForAdmin = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const psychologistId = Array.isArray(req.params.psychologistId) 
      ? req.params.psychologistId[0] 
      : req.params.psychologistId;
    const result = await payoutDetailsService.getPayoutDetailsForAdmin(psychologistId);
    
    if (!result) {
      res.status(200).json(ApiResponse.success(null, "No payout details found for this psychologist"));
    } else {
      res.status(200).json(ApiResponse.success(result, "Payout details retrieved successfully"));
    }
  });

  reviewPayoutDetails = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const psychologistId = Array.isArray(req.params.psychologistId) 
      ? req.params.psychologistId[0] 
      : req.params.psychologistId;
    const adminUserId = req.user?.userId as string;
    const { status } = req.body;
    
    const result = await payoutDetailsService.reviewPayoutDetails(
      psychologistId,
      adminUserId,
      status,
    );
    res.status(200).json(ApiResponse.success(result, "Payout details status updated successfully"));
  });
}

export const payoutDetailsController = new PayoutDetailsController();
