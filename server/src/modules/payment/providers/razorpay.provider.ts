import crypto from "crypto";
import { razorpayClient } from "@/config/razorpay";
import { env } from "@/config/env";
import {
  PaymentProvider,
  CreatePaymentOrderParams,
  PaymentOrder,
  VerifyPaymentParams,
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
    const hmac = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET);
    hmac.update(params.orderId + "|" + params.paymentId);
    const generatedSignature = hmac.digest("hex");
    return generatedSignature === params.signature;
  }
}

export const razorpayProvider = new RazorpayProvider();
