import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { authService } from "./auth.service";
import { env } from "@/config/env";

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.register(req.body);
    res.status(201).json(ApiResponse.success(result, "User registered successfully"));
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.verifyOtp(req.body);
    const { refreshToken, ...responseData } = result;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json(ApiResponse.success(responseData, "OTP verified successfully"));
  });

  login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken, ...result } = await authService.login(req.body);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json(ApiResponse.success(result, "Login successful"));
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
        code: "UNAUTHORIZED",
      });
    }

    const { refreshToken: newRefreshToken, ...result } = await authService.refreshToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json(ApiResponse.success(result, "Token refreshed successfully"));
  });

  logout = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.status(200).json(ApiResponse.success(null, "Logout successful"));
  });
}

export const authController = new AuthController();
