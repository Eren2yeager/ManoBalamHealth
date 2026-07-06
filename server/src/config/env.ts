import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000"),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  REDIS_URL: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_DELIVERY_MODE: z.enum(["resend", "console"]).default("resend"),
  EMAIL_FROM: z.string().min(3).optional(),
  MSG91_API_KEY: z.string().optional(),
  METERED_TURN_CREDENTIALS_URL: z.string().url(),
  CLIENT_ORIGIN: z.string().min(1),
}).superRefine((data, context) => {
  if (data.NODE_ENV === "production" && data.EMAIL_DELIVERY_MODE !== "resend") {
    context.addIssue({
      code: "custom",
      path: ["EMAIL_DELIVERY_MODE"],
      message: "Production email delivery must use resend",
    });
  }
  if (
    data.NODE_ENV === "production" &&
    (!data.EMAIL_FROM || data.EMAIL_FROM.includes("@resend.dev"))
  ) {
    context.addIssue({
      code: "custom",
      path: ["EMAIL_FROM"],
      message: "Production requires EMAIL_FROM on a verified sending domain",
    });
  }
  if (
    data.NODE_ENV === "production" &&
    data.RAZORPAY_WEBHOOK_SECRET.toLowerCase().includes("your-razorpay")
  ) {
    context.addIssue({
      code: "custom",
      path: ["RAZORPAY_WEBHOOK_SECRET"],
      message: "Production requires the real Razorpay webhook signing secret",
    });
  }
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
