import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { adminService } from "./admin.service";
import { StatusCodes } from "../../constants/statusCodes.constant";

export class AdminController {
  getPsychologists = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getPsychologists(req.query as any);
    res.status(StatusCodes.OK).json(ApiResponse.success(result.data, "Psychologists retrieved successfully", result.meta));
  });

  updatePsychologistStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.updatePsychologistStatus(req.params.id as string, req.body);
    res.status(StatusCodes.OK).json(ApiResponse.success(result, "Psychologist status updated successfully"));
  });

  getAppointments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAppointments(req.query as any);
    res.status(StatusCodes.OK).json(ApiResponse.success(result.data, "Appointments retrieved successfully", result.meta));
  });

  getReportsSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const summary = await adminService.getReportsSummary();
    res.status(StatusCodes.OK).json(ApiResponse.success(summary, "Reports summary retrieved successfully"));
  });

  processRefund = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.processRefund(req.params.appointmentId as string, req.body);
    res.status(StatusCodes.OK).json(ApiResponse.success(result, "Refund processed successfully"));
  });
}

export const adminController = new AdminController();
