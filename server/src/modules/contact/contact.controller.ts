import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { contactService } from "./contact.service";

class ContactController {
  createRequest = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await contactService.createRequest(req.body);
    res.status(StatusCodes.CREATED).json(ApiResponse.success(result, "Contact request received"));
  });
}

export const contactController = new ContactController();

