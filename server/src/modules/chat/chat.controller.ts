import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
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
}

export const chatController = new ChatController();
