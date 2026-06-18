import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { sessionService } from "./session.service";

export class SessionController {
  getSessionByAppointmentId = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await sessionService.getSessionByAppointmentId(
        req.params.appointmentId as string,
        req.user!.userId,
        req.user!.role
      );
      res.status(200).json(ApiResponse.success(result, "Session retrieved successfully"));
    }
  );

  updateSessionNotes = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await sessionService.updateSessionNotes(
        req.params.sessionId as string,
        req.user!.userId,
        req.body
      );
      res.status(200).json(ApiResponse.success(result, "Session notes updated successfully"));
    }
  );
}

export const sessionController = new SessionController();
