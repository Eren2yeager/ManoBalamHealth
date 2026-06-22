import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserModel } from "@/modules/user/user.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { generateOtp, storeOtp, verifyOtp } from "@/utils/otp";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/middlewares/auth.middleware";
import { sendOtpEmail, sendPasswordResetEmail } from "@/modules/notification/channels/email.channel";
import redis from "@/config/redis";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ResendOtpRequest,
} from "./auth.types";

export class AuthService {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    logger.debug("AuthService.register called", { metadata: { role: data.role } });
    
    // Check if email or phone already exists
    const existingEmail = await UserModel.findOne({ email: data.email });
    if (existingEmail) {
      logger.warn("Registration failed: email already exists", { metadata: { email: data.email } });
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.DUPLICATE_EMAIL,
        "Email already registered"
      );
    }

    if (data.phone) {
      const existingPhone = await UserModel.findOne({ phone: data.phone });
      if (existingPhone) {
        logger.warn("Registration failed: phone already exists", { metadata: { phone: data.phone } });
        throw new ApiError(
          StatusCodes.CONFLICT,
          ErrorCodes.DUPLICATE_PHONE,
          "Phone already registered"
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role,
      country: data.country,
      timezone: data.timezone,
    });

    if (data.role === "psychologist") {
      try {
        await PsychologistModel.create({
          userId: user._id,
          consultationFee: { amount: 0, currency: "INR" },
          onboardingStatus: "profile_incomplete",
        });
      } catch (error) {
        await UserModel.findByIdAndDelete(user._id);
        throw error;
      }
    }

    logger.info("New user registered successfully", { metadata: { userId: user._id.toString(), role: data.role } });

    // Generate and store OTP
    const otp = generateOtp();
    await storeOtp(user._id.toString(), otp);

    const otpSentTo = "email";

    try {
      await sendOtpEmail(data.email, user.name, otp);
      logger.info("OTP email sent", { metadata: { userId: user._id.toString() } });
    } catch (err) {
      logger.error("Failed to send OTP email", { error: err, metadata: { userId: user._id.toString() } });
      await redis.del(`otp:${user._id.toString()}`);
      await PsychologistModel.deleteOne({ userId: user._id });
      await UserModel.findByIdAndDelete(user._id);
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        "Unable to send verification email. Please try again.",
      );
    }

    logger.debug("OTP generated for new user", { metadata: { userId: user._id.toString(), otpSentTo } });

    return {
      userId: user._id.toString(),
      email: data.email,
      phone: data.phone,
      otpSentTo,
    };
  }

  async resendOtp(data: ResendOtpRequest): Promise<void> {
    const user = await UserModel.findById(data.userId);
    if (!user || !user.email) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Account not found");
    }
    if (user.isVerified) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Account is already verified",
      );
    }
    const otp = generateOtp();
    await storeOtp(user._id.toString(), otp);
    await sendOtpEmail(user.email, user.name, otp);
    logger.info("OTP resent", { metadata: { userId: user._id.toString() } });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await UserModel.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await redis.set(`password-reset:${tokenHash}`, user._id.toString(), "EX", 15 * 60);
    const resetUrl = `${env.CLIENT_ORIGIN.replace(/\/$/, "")}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email!, user.name, resetUrl);
    logger.info("Password reset email sent", { metadata: { userId: user._id.toString() } });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const key = `password-reset:${tokenHash}`;
    const userId = await redis.get(key);
    if (!userId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        ErrorCodes.TOKEN_INVALID,
        "Password reset link is invalid or expired",
      );
    }
    const user = await UserModel.findById(userId);
    if (!user || !user.isActive) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Account not found");
    }
    user.passwordHash = await bcrypt.hash(password, 12);
    user.authVersion = (user.authVersion ?? 0) + 1;
    await user.save();
    await redis.del(key);
    logger.info("Password reset completed", { metadata: { userId } });
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    logger.debug("AuthService.verifyOtp called", { metadata: { userId: data.userId } });
    
    // Find user
    const user = await UserModel.findById(data.userId);
    if (!user) {
      logger.warn("OTP verification failed: user not found", { metadata: { userId: data.userId } });
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found");
    }

    // Verify OTP
    const isValid = await verifyOtp(user._id.toString(), data.otp);
    if (!isValid) {
      logger.warn("OTP verification failed: invalid OTP", { metadata: { userId: data.userId } });
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.OTP_INVALID, "Invalid OTP");
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    logger.info("User verified successfully", { metadata: { userId: user._id.toString() } });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role, user.authVersion ?? 0);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role, user.authVersion ?? 0);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async login(data: LoginRequest): Promise<LoginResponse & { refreshToken: string }> {
    logger.debug("AuthService.login called", { metadata: { emailOrPhone: data.emailOrPhone } });
    
    // Find user by email or phone
    const user = await UserModel.findOne({
      $or: [{ email: data.emailOrPhone }, { phone: data.emailOrPhone }],
    });

    if (!user) {
      logger.warn("Login failed: user not found", { metadata: { emailOrPhone: data.emailOrPhone } });
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS,
        "Invalid credentials"
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      logger.warn("Login failed: account not verified", { metadata: { userId: user._id.toString() } });
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        ErrorCodes.FORBIDDEN_ROLE,
        "Account not verified",
        { userId: user._id.toString(), otpSentTo: "email" },
      );
    }

    if (!user.isActive) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        ErrorCodes.ACCOUNT_INACTIVE,
        "Account is inactive",
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn("Login failed: invalid password", { metadata: { userId: user._id.toString() } });
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ErrorCodes.INVALID_CREDENTIALS,
        "Invalid credentials"
      );
    }

    logger.info("User logged in successfully", { metadata: { userId: user._id.toString(), role: user.role } });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.role, user.authVersion ?? 0);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role, user.authVersion ?? 0);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse & { refreshToken: string }> {
    try {
      const payload = verifyRefreshToken(token);
      
      // Verify user still exists
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found");
      }
      if (!user.isActive || !user.isVerified) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          ErrorCodes.ACCOUNT_INACTIVE,
          "Account is not active",
        );
      }
      if ((user.authVersion ?? 0) !== payload.authVersion) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          ErrorCodes.TOKEN_INVALID,
          "Refresh token is no longer valid",
        );
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(user._id.toString(), user.role, user.authVersion ?? 0);
      const newRefreshToken = generateRefreshToken(user._id.toString(), user.role, user.authVersion ?? 0);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ErrorCodes.TOKEN_INVALID,
        "Invalid refresh token"
      );
    }
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = verifyRefreshToken(refreshToken);
      await UserModel.findByIdAndUpdate(payload.userId, { $inc: { authVersion: 1 } });
    } catch {
      // Logout remains idempotent even when the cookie is expired or malformed.
    }
  }
}

export const authService = new AuthService();
