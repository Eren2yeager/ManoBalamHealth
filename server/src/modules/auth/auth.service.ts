import bcrypt from "bcrypt";
import { UserModel } from "@/modules/user/user.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { generateOtp, storeOtp, verifyOtp } from "@/utils/otp";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/middlewares/auth.middleware";
import { sendOtpEmail } from "@/modules/notification/channels/email.channel";
import { logger } from "@/utils/logger";
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from "./auth.types";

export class AuthService {
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    logger.debug("AuthService.register called", { metadata: { role: data.role } });
    
    // Check if email or phone already exists
    if (data.email) {
      const existingEmail = await UserModel.findOne({ email: data.email });
      if (existingEmail) {
        logger.warn("Registration failed: email already exists", { metadata: { email: data.email } });
        throw new ApiError(
          StatusCodes.CONFLICT,
          ErrorCodes.DUPLICATE_EMAIL,
          "Email already registered"
        );
      }
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

    logger.info("New user registered successfully", { metadata: { userId: user._id.toString(), role: data.role } });

    // Generate and store OTP
    const otp = generateOtp();
    logger.debug(`Otp for ${data.email} : ${otp}`)
    await storeOtp(user._id.toString(), otp);

    const otpSentTo = data.email ? "email" : "phone";

    // Send OTP via the appropriate channel
    if (data.email) {
      try {
        await sendOtpEmail(data.email, user.name, otp);
        logger.info("OTP email sent", { metadata: { userId: user._id.toString() } });
      } catch (err) {
        // Log the failure but don't block registration — user can request a resend
        logger.error("Failed to send OTP email", { error: err, metadata: { userId: user._id.toString() } });
      }
    }
    // SMS (phone OTP) is not implemented yet — MSG91_API_KEY not configured

    logger.debug("OTP generated for new user", { metadata: { userId: user._id.toString(), otpSentTo } });

    return {
      userId: user._id.toString(),
      email: data.email,
      phone: data.phone,
      otpSentTo,
    };
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
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

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
        "Account not verified"
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
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

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

      // Generate new tokens
      const newAccessToken = generateAccessToken(user._id.toString(), user.role);
      const newRefreshToken = generateRefreshToken(user._id.toString(), user.role);

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
}

export const authService = new AuthService();
