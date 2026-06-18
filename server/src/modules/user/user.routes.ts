import { Router } from "express";
import { userController } from "./user.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { upload } from "@/middlewares/upload.middleware";
import { updateUserSchema } from "./user.validation";

const router = Router();

router.get("/me", requireAuth, userController.getMe);
router.patch("/me", requireAuth, validate(updateUserSchema), userController.updateMe);
router.post("/me/avatar", requireAuth, upload.single("avatar"), userController.uploadAvatar);

export default router;
