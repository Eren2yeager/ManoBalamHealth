import crypto from "crypto";
import redis from "@/config/redis";

export const generateOtp = (length = 6): string => {
  return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, "0");
};

export const storeOtp = async (userId: string, otp: string): Promise<void> => {
  // Store OTP in Redis with 5-minute expiry
  await redis.set(`otp:${userId}`, otp, "EX" as any, 300);
};

export const verifyOtp = async (userId: string, otp: string): Promise<boolean> => {
  const storedOtp = await redis.get(`otp:${userId}`);
  if (!storedOtp) return false;

  const isValid = storedOtp === otp;
  if (isValid) {
    // Delete OTP after successful verification
    await redis.del(`otp:${userId}`);
  }
  return isValid;
};
