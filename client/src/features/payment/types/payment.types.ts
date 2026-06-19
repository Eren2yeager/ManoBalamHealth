export interface CreateOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
}

export interface VerifyPaymentDto {
  appointmentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  appointmentId: string;
  status: "confirmed";
  paymentId: string;
}