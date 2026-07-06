import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { adminService } from "./admin.service";
import { StatusCodes } from "../../constants/statusCodes.constant";

export class AdminController {
  getPsychologists = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await adminService.getPsychologists(req.validatedData?.query as any);
    res.status(StatusCodes.OK).json(ApiResponse.success(result.data, "Psychologists retrieved successfully", result.meta));
  });

  // PATCH /admin/psychologists/:id/verify — body: { decision, rejectionReason? }
  updatePsychologistStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await adminService.updatePsychologistStatus(
      req.params.id as string,
      req.body,
      req.user!.userId,
    );
    res.status(StatusCodes.OK).json(ApiResponse.success(result, "Psychologist status updated"));
  });

  // PATCH /admin/psychologists/:id/changes — body: { decision, rejectionReason? }
  reviewPendingChanges = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await adminService.reviewPendingChanges(
      req.params.id as string,
      req.body,
      req.user!.userId,
    );
    res.status(StatusCodes.OK).json(ApiResponse.success(result, "Pending changes reviewed"));
  });

  getAppointments = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await adminService.getAppointments(req.query as any);
    res.status(StatusCodes.OK).json(ApiResponse.success(result.data, "Appointments retrieved successfully", result.meta));
  });

  getReportsSummary = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const summary = await adminService.getReportsSummary();
    res.status(StatusCodes.OK).json(ApiResponse.success(summary, "Reports summary retrieved successfully"));
  });

  // PATCH /admin/payments/:id/refund — body: { reason, amount? }
  processRefund = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await adminService.processRefund(req.params.id as string, req.body);
    res.status(StatusCodes.OK).json(ApiResponse.success(result, "Refund processed successfully"));
  });
}

export const adminController = new AdminController();
