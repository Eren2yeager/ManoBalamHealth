import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import { authRateLimiter } from "@/middlewares/rateLimit.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./auth.validation";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/verify-otp", authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post("/resend-otp", authRateLimiter, validate(resendOtpSchema), authController.resendOtp);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
