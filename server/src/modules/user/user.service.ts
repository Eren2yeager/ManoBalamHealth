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
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
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
          folder: "manobalam/avatars",
          resource_type: "image",
          transformation: [{ width: 200, height: 200, crop: "fill" }],
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

          // Update user with new avatar URL
          const user = await UserModel.findByIdAndUpdate(
            userId,
            { $set: { avatarUrl: result.secure_url } },
            { new: true }
          );

          if (!user) {
            return reject(
              new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "User not found")
            );
          }

          resolve({ avatarUrl: result.secure_url });
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
