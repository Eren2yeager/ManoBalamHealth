import { z } from "zod";

// IFSC code regex: 4 letters (bank code) + 0 + 6 alphanumeric characters (branch code)
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// UPI ID regex: localpart@handle (e.g., name@bank or mobile@upi)
const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

export const createPayoutDetailsSchema = z.object({
  accountHolderName: z
    .string()
    .trim()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name must not exceed 100 characters"),
  bankName: z
    .string()
    .trim()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name must not exceed 100 characters"),
  accountNumber: z
    .string()
    .trim()
    .min(9, "Account number must be at least 9 digits")
    .max(18, "Account number must not exceed 18 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  accountNumberConfirmation: z
    .string()
    .trim(),
  ifscCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(IFSC_REGEX, "Invalid IFSC code format (e.g., SBIN0001234)"),
  accountType: z
    .enum(["savings", "current"], {
      message: "Account type must be either savings or current",
    }),
  branchName: z
    .string()
    .trim()
    .max(100, "Branch name must not exceed 100 characters")
    .optional(),
  upiId: z
    .string()
    .trim()
    .toLowerCase()
    .regex(UPI_REGEX, "Invalid UPI ID format (e.g., name@upi)")
    .optional(),
}).refine((data) => data.accountNumber === data.accountNumberConfirmation, {
  message: "Account numbers do not match",
  path: ["accountNumberConfirmation"],
});

export const updatePayoutDetailsSchema = z.object({
  accountHolderName: z
    .string()
    .trim()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name must not exceed 100 characters")
    .optional(),
  bankName: z
    .string()
    .trim()
    .min(2, "Bank name must be at least 2 characters")
    .max(100, "Bank name must not exceed 100 characters")
    .optional(),
  accountNumber: z
    .string()
    .trim()
    .min(9, "Account number must be at least 9 digits")
    .max(18, "Account number must not exceed 18 digits")
    .regex(/^\d+$/, "Account number must contain only digits")
    .optional(),
  accountNumberConfirmation: z
    .string()
    .trim()
    .optional(),
  ifscCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(IFSC_REGEX, "Invalid IFSC code format (e.g., SBIN0001234)")
    .optional(),
  accountType: z
    .enum(["savings", "current"])
    .optional(),
  branchName: z
    .string()
    .trim()
    .max(100, "Branch name must not exceed 100 characters")
    .optional(),
  upiId: z
    .string()
    .trim()
    .toLowerCase()
    .regex(UPI_REGEX, "Invalid UPI ID format (e.g., name@upi)")
    .optional(),
}).refine((data) => {
  // If account number is being updated, confirmation must match
  if (data.accountNumber !== undefined) {
    return data.accountNumber === data.accountNumberConfirmation;
  }
  return true;
}, {
  message: "Account numbers do not match",
  path: ["accountNumberConfirmation"],
});

export const reviewPayoutDetailsSchema = z.object({
  status: z.enum(["saved", "under_review"]),
});

export const getPayoutsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  psychologistId: z.string().optional(),
  status: z.enum(["not_ready", "eligible", "processing", "paid", "failed", "on_hold"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const createPayoutSchema = z.object({
  psychologistId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid psychologist ID"),
  appointmentIds: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid appointment ID")).min(1),
  commissionRate: z.number().min(0).max(100).optional(), // Commission percentage if applicable
});

export const updatePayoutSchema = z.object({
  status: z.enum(["processing", "paid", "failed", "on_hold"]).optional(),
  providerReference: z.string().optional(),
  failureReason: z.string().optional(),
  holdReason: z.string().optional(),
});

export const completeManualPayoutSchema = z.object({
  paymentMethod: z.enum(["bank_transfer", "upi"]),
  transactionReference: z
    .string()
    .trim()
    .min(3, "Transaction reference must be at least 3 characters")
    .max(200, "Transaction reference must not exceed 200 characters"),
});

export const createPayoutBatchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Batch name is required")
    .max(100, "Batch name must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  payoutIds: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid payout ID")).min(1),
});

export const updatePayoutBatchSchema = z.object({
  status: z.enum(["processing", "completed", "failed"]).optional(),
  providerBatchReference: z.string().optional(),
  failureReason: z.string().optional(),
});
