import { Router } from "express";
import { contactRateLimiter } from "@/middlewares/rateLimit.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { contactController } from "./contact.controller";
import { createContactRequestSchema } from "./contact.validation";

const router = Router();

router.post("/", contactRateLimiter, validate(createContactRequestSchema), contactController.createRequest);

export default router;

