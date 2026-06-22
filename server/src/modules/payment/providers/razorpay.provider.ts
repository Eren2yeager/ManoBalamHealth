import crypto from "crypto";
import { razorpayClient } from "@/config/razorpay";
import { env } from "@/config/env";
import {
  PaymentProvider,
  CreatePaymentOrderParams,
  PaymentOrder,
  VerifyPaymentParams,
  CreateRefundParams,
  PaymentRefund,
} from "./paymentProvider.interface";

class RazorpayProvider implements PaymentProvider {
  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrder> {
    const order = await razorpayClient.orders.create({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    });

    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      status: order.status,
    };
  }

  verifyPayment(params: VerifyPaymentParams): boolean {
    const hmac = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET);
    hmac.update(params.orderId + "|" + params.paymentId);
    const generatedSignature = hmac.digest("hex");
    const generatedBuffer = Buffer.from(generatedSignature);
    const receivedBuffer = Buffer.from(params.signature);
    return (
      generatedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    );
  }

  async createRefund(params: CreateRefundParams): Promise<PaymentRefund> {
    const refund = await razorpayClient.payments.refund(params.paymentId, {
      ...(params.amount ? { amount: params.amount } : {}),
      ...(params.notes ? { notes: params.notes } : {}),
    });

    return {
      id: refund.id,
      amount: Number(refund.amount),
      status: refund.status ?? "processed",
    };
  }
}

export const razorpayProvider = new RazorpayProvider();
