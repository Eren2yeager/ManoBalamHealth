import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { logger } from "@/utils/logger";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

logger.info("Cloudinary configured successfully");

export { cloudinary };
