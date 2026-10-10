import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { chatService } from "./chat.service";

export class ChatController {
  getChatHistory = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await chatService.getChatHistory(
        req.params.sessionId as string,
        req.user!.userId,
        req.user!.role,
        req.query as any
      );
      res.status(200).json(ApiResponse.success(result.data, "Chat history retrieved successfully", result.meta));
    }
  );

  uploadAttachment = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.file) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          ErrorCodes.VALIDATION_ERROR,
          "No file provided"
        );
      }
      const result = await chatService.uploadAttachment(
        req.params.sessionId as string,
        req.user!.userId,
        req.file as Express.Multer.File
      );
      res.status(201).json(ApiResponse.success(result, "Attachment uploaded successfully"));
    }
  );
}

export const chatController = new ChatController();
