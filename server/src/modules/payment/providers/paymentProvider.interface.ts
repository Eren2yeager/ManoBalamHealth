export interface CreatePaymentOrderParams {
  amount: number; // in smallest currency unit (e.g., paise for INR)
  currency: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface CreateRefundParams {
  paymentId: string;
  amount?: number;
  notes?: Record<string, string>;
}

export interface PaymentRefund {
  id: string;
  amount: number;
  status: string;
}

export interface PaymentProvider {
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrder>;
  verifyPayment(params: VerifyPaymentParams): boolean;
  createRefund(params: CreateRefundParams): Promise<PaymentRefund>;
}
