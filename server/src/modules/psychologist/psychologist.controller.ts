import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { psychologistService } from "./psychologist.service";
import { UserModel } from "../user/user.model";

export class PsychologistController {
  getPsychologists = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Get requester's country if authenticated
    let requesterCountry: string | undefined;
    if (req.user?.userId) {
      const user = await UserModel.findById(req.user.userId);
      requesterCountry = user?.country;
    }

    // Get validated query data
    const validatedQuery = req.validatedData?.query;

    const result = await psychologistService.getPsychologists(
      validatedQuery as any,
      requesterCountry,
    );

    res.status(200).json(ApiResponse.success(result.data, "Psychologists retrieved successfully", result.meta));
  });

  getPsychologistById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await psychologistService.getPsychologistById(
      id,
      req.user?.userId,
      req.user?.role,
    );

    res.status(200).json(ApiResponse.success(result, "Psychologist retrieved successfully"));
  });

  updateMyProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const result = await psychologistService.updateMyProfile(userId, req.body);

    res.status(200).json(ApiResponse.success(result, "Profile updated successfully"));
  });

  uploadCredentials = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const files = req.files as Express.Multer.File[];
    const type = req.validatedData?.body.type as "license" | "degree" | "id_proof";

    if (!files || files.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        "Please upload at least one document"
      );
    }

    const result = await psychologistService.uploadCredentials(userId, files, type);

    res.status(201).json(ApiResponse.success(result, "Credentials uploaded successfully"));
  });
}

export const psychologistController = new PsychologistController();
