import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { userService } from "./user.service";

export class UserController {
  getMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const result = await userService.getMe(userId);
    res.status(200).json(ApiResponse.success(result, "User profile retrieved successfully"));
  });

  updateMe = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const result = await userService.updateMe(userId, req.body);
    res.status(200).json(ApiResponse.success(result, "User profile updated successfully"));
  });

  uploadAvatar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const result = await userService.uploadAvatar(userId, req.file as Express.Multer.File);
    res.status(200).json(ApiResponse.success(result, "Avatar uploaded successfully"));
  });
}

export const userController = new UserController();
