import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { env } from "@/config/env";
import { Role } from "@/constants/roles.constant";
import { UserModel } from "@/modules/user/user.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";

interface AccessTokenPayload {
  userId: string;
  role: Role;
  authVersion: number;
}

interface RefreshTokenPayload {
  userId: string;
  role: Role;
  authVersion: number;
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED, "Missing token"));
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    const user = await UserModel.findById(payload.userId).select("role isActive isVerified authVersion");
    if (!user || !user.isActive) {
      return next(new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.ACCOUNT_INACTIVE, "Account is inactive"));
    }
    if (
      !user.isVerified ||
      user.role !== payload.role ||
      (user.authVersion ?? 0) !== payload.authVersion
    ) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.TOKEN_INVALID, "Authentication state is invalid"));
    }
    req.user = { userId: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.TOKEN_EXPIRED, "Token expired"));
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.TOKEN_INVALID, "Invalid token"));
  }
};

export const requireRole = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "Insufficient permissions")
      );
    }
    next();
  };

export const requireActiveUser = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED, "Authentication required"));
  }
  const user = await UserModel.findById(req.user.userId).select("isActive isVerified");
  if (!user || !user.isActive) {
    return next(new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.ACCOUNT_INACTIVE, "Account is inactive"));
  }
  if (!user.isVerified) {
    return next(new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "Account is not verified"));
  }
  next();
};

export const requireApprovedPsychologist = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "psychologist") {
    return next(new ApiError(StatusCodes.FORBIDDEN, ErrorCodes.FORBIDDEN_ROLE, "Psychologist role required"));
  }
  const profile = await PsychologistModel.findOne({ userId: req.user.userId }).select(
    "verificationStatus onboardingStatus",
  );
  if (
    !profile ||
    profile.verificationStatus !== "approved" ||
    profile.onboardingStatus !== "approved"
  ) {
    return next(
      new ApiError(
        StatusCodes.FORBIDDEN,
        ErrorCodes.PSYCHOLOGIST_NOT_VERIFIED,
        "Psychologist approval is required for this action",
      ),
    );
  }
  next();
};

export const requireApprovalIfPsychologist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "psychologist") {
    next();
    return;
  }
  await requireApprovedPsychologist(req, res, next);
};

export const generateAccessToken = (userId: string, role: Role, authVersion: number): string => {
  return jwt.sign({ userId, role, authVersion }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string, role: Role, authVersion: number): string => {
  return jwt.sign({ userId, role, authVersion }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
};
