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

export interface PaymentProvider {
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrder>;
  verifyPayment(params: VerifyPaymentParams): boolean;
}
