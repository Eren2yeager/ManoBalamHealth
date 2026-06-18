import { Router } from "express";
import { crisisController } from "./crisis.controller";
import { validate } from "@/middlewares/validate.middleware";
import { getCrisisResourcesSchema } from "./crisis.validation";

const router = Router();

// Get crisis resources (public)
router.get(
  "/resources",
  validate(getCrisisResourcesSchema, "query"),
  crisisController.getResources
);

export default router;
