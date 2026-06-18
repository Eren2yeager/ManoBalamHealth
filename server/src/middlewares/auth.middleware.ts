import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { env } from "@/config/env";
import { Role } from "@/constants/roles.constant";

interface AccessTokenPayload {
  userId: string;
  role: Role;
}

interface RefreshTokenPayload {
  userId: string;
  role: Role;
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED, "Missing token"));
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.user = payload;
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

export const generateAccessToken = (userId: string, role: Role): string => {
  return jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string, role: Role): string => {
  return jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
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
