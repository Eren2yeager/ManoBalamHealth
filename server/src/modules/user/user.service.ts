import { UserModel, IUser } from "./user.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { cloudinary } from "@/config/cloudinary";
import { Readable } from "stream";
import type { UpdateUserRequest, UserResponse, UploadAvatarResponse } from "./user.types";
import { toUserResponse } from "./user.types";

export class UserService {
  async getMe(userId: string): Promise<UserResponse> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found");
    }
    return toUserResponse(user);
  }

  async updateMe(userId: string, data: UpdateUserRequest): Promise<UserResponse> {
    const fieldsToSet: Record<string, unknown> = {};
    const fieldsToUnset: Record<string, 1> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === null) fieldsToUnset[key] = 1;
      else if (value !== undefined) fieldsToSet[key] = value;
    }

    const update: Record<string, unknown> = {};
    if (Object.keys(fieldsToSet).length > 0) update.$set = fieldsToSet;
    if (Object.keys(fieldsToUnset).length > 0) update.$unset = fieldsToUnset;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      update,
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found");
    }
    return toUserResponse(user);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<UploadAvatarResponse> {
    if (!file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR, "No file provided");
    }

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: `manobalam/avatars/${userId}`,
          overwrite: true,
          invalidate: true,
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          resource_type: "image",
          transformation: [
            { width: 512, height: 512, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        async (error, result) => {
          if (error || !result?.secure_url) {
            return reject(
              new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                ErrorCodes.INTERNAL_ERROR,
                "Failed to upload avatar"
              )
            );
          }

          try {
            const user = await UserModel.findByIdAndUpdate(
              userId,
              { $set: { avatarUrl: result.secure_url } },
              { new: true },
            );

            if (!user) {
              return reject(
                new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found"),
              );
            }

            resolve({ avatarUrl: result.secure_url });
          } catch {
            reject(
              new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                ErrorCodes.INTERNAL_ERROR,
                "Avatar uploaded but the profile could not be updated",
              ),
            );
          }
        }
      );

      // Convert buffer to readable stream
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }
}

export const userService = new UserService();
