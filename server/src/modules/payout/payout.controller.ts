import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { payoutService } from "./payout.service";

export class PayoutController {
  getPayoutReadiness = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await payoutService.getPayoutReadiness();
    res.status(200).json(ApiResponse.success(result.data, "Payout readiness retrieved", result.meta));
  });

  createPayout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const adminUserId = req.user?.userId as string;
    const { psychologistId, appointmentIds, commissionRate } = req.body;

    const result = await payoutService.createPayout(
      psychologistId,
      appointmentIds,
      commissionRate,
      adminUserId,
    );
    res.status(201).json(ApiResponse.success(result, "Payout created successfully"));
  });

  getPayouts = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const validatedQuery = req.validatedData?.query;
    const result = await payoutService.getPayouts(validatedQuery as any);
    res.status(200).json(ApiResponse.success(result.data, "Payouts retrieved", result.meta));
  });

  getPayoutById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payoutId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await payoutService.getPayoutById(payoutId);
    res.status(200).json(ApiResponse.success(result, "Payout retrieved successfully"));
  });

  getManualPayoutInstructions = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payoutId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await payoutService.getManualPayoutInstructions(payoutId);
    res.status(200).json(ApiResponse.success(result, "Manual payout instructions retrieved"));
  });

  completeManualPayout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payoutId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const adminUserId = req.user?.userId as string;
    const result = await payoutService.completeManualPayout(payoutId, req.body, adminUserId);
    res.status(200).json(ApiResponse.success(result, "Manual payout recorded as paid"));
  });

  updatePayout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payoutId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const adminUserId = req.user?.userId as string;
    const result = await payoutService.updatePayout(payoutId, req.body, adminUserId);
    res.status(200).json(ApiResponse.success(result, "Payout updated successfully"));
  });
}

export const payoutController = new PayoutController();
