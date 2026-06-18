import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "@/middlewares/validate.middleware";
import { authRateLimiter } from "@/middlewares/rateLimit.middleware";
import { requireAuth } from "@/middlewares/auth.middleware";
import { registerSchema, verifyOtpSchema, loginSchema } from "./auth.validation";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/verify-otp", authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", requireAuth, authController.logout);

export default router;
