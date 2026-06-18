import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  provider: "razorpay";
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "refunded";
  refundReason?: string;
  refundedAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["razorpay"], default: "razorpay" },
    providerOrderId: { type: String, required: true },
    providerPaymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
    refundReason: { type: String },
    refundedAmount: { type: Number },
  },
  { timestamps: true }
);

export const PaymentModel = model<IPayment>("Payment", paymentSchema);
