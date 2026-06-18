import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { paymentService } from "./payment.service";
import { env } from "@/config/env";

class PaymentController {
  /**
   * Create payment order
   */
  createPaymentOrder = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const validatedBody = req.validatedData?.body || req.body;
    const result = await paymentService.createPaymentOrder(userId, validatedBody);
    res.status(200).json(ApiResponse.success(result, "Payment order created successfully"));
  });

  /**
   * Verify payment
   */
  verifyPayment = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId as string;
    const validatedBody = req.validatedData?.body || req.body;
    const result = await paymentService.verifyPayment(userId, validatedBody);
    res.status(200).json(ApiResponse.success(result, "Payment verified successfully"));
  });

  /**
   * Handle Razorpay webhook (uses raw body parser)
   */
  handleWebhook = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Get raw body (Buffer from express.raw())
    const payload = req.body as Buffer;
    const signature = req.headers["x-razorpay-signature"] as string;

    await paymentService.handleRazorpayWebhook(payload.toString(), signature);

    // Always return 200 to Razorpay
    res.status(200).json(ApiResponse.success(null, "Webhook received"));
  });
}

export const paymentController = new PaymentController();
