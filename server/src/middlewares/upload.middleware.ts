import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const storage = multer.memoryStorage();

const avatarMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (avatarMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        "Avatar must be a JPEG, PNG, or WebP image",
      ),
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter,
});

const credentialFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        "Credentials must be PDF, PNG, or JPEG files",
      ),
    );
  }
};

export const credentialUpload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 5,
  },
  fileFilter: credentialFileFilter,
});

const chatAttachmentMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const chatAttachmentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (chatAttachmentMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        ErrorCodes.VALIDATION_ERROR,
        "Attachments must be JPEG, PNG, WebP, GIF, or PDF files",
      ),
    );
  }
};

export const chatAttachmentUpload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
  fileFilter: chatAttachmentFileFilter,
});
