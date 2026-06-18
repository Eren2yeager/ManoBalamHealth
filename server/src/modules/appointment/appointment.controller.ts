import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { appointmentService } from "./appointment.service";

class AppointmentController {
  /**
   * Create appointment
   */
  createAppointment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const validatedBody = req.validatedData?.body || req.body;
    const result = await appointmentService.createAppointment(userId, validatedBody);
    res.status(201).json(ApiResponse.success(result, "Appointment created successfully"));
  });

  /**
   * Get my appointments
   */
  getMyAppointments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as any;
    const validatedQuery = req.validatedData?.query || req.query;
    const result = await appointmentService.getMyAppointments(userId, userRole, validatedQuery as any);
    res.status(200).json(ApiResponse.success(result.data, "Appointments retrieved successfully", result.meta));
  });

  /**
   * Get appointment by ID
   */
  getAppointmentById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as any;
    const appointmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await appointmentService.getAppointmentById(appointmentId, userId, userRole);
    res.status(200).json(ApiResponse.success(result, "Appointment retrieved successfully"));
  });

  /**
   * Cancel appointment
   */
  cancelAppointment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as any;
    const appointmentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validatedBody = req.validatedData?.body || req.body;
    const result = await appointmentService.cancelAppointment(appointmentId, userId, userRole, validatedBody);
    res.status(200).json(ApiResponse.success(result, "Appointment cancelled successfully"));
  });
}

export const appointmentController = new AppointmentController();
