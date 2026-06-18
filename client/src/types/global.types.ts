// Matches backend ApiResponse envelope (BACKEND_PLAN.md section 2.5) exactly.
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

// Matches backend constants/roles.constant.ts
export type Role = "patient" | "psychologist" | "admin";

export type ConsultationMode = "chat" | "audio" | "video";

export type AllocationMode = "manual" | "auto" | "emergency";

export type AppointmentStatus =
  | "pending_payment"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type RiskLevel = "low" | "moderate" | "high" | "severe";

// Matches backend constants/errorCodes.constant.ts — frontend switches on these,
// never on the human-readable `message` string, since messages can change wording freely.
export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  FORBIDDEN_ROLE: "FORBIDDEN_ROLE",
  NOT_FOUND: "NOT_FOUND",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_PHONE: "DUPLICATE_PHONE",
  OTP_INVALID: "OTP_INVALID",
  OTP_EXPIRED: "OTP_EXPIRED",
  SLOT_ALREADY_BOOKED: "SLOT_ALREADY_BOOKED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_SIGNATURE_INVALID: "PAYMENT_SIGNATURE_INVALID",
  PSYCHOLOGIST_NOT_VERIFIED: "PSYCHOLOGIST_NOT_VERIFIED",
  NO_PSYCHOLOGIST_AVAILABLE: "NO_PSYCHOLOGIST_AVAILABLE",
  EMERGENCY_REQUEST_TIMEOUT: "EMERGENCY_REQUEST_TIMEOUT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface Money {
  amount: number; // smallest currency unit — convert for display via utils/formatters.ts
  currency: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
