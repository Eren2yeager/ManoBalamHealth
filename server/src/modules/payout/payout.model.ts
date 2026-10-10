import { Schema, model, Document, Types } from "mongoose";

export interface IPayoutAppointmentAllocation {
  appointmentId: Types.ObjectId;
  amount: number; // Amount allocated to this appointment (in paise)
}

export interface IPayout extends Document {
  psychologistId: Types.ObjectId;
  batchId?: Types.ObjectId; // Optional: if part of a batch
  coveredAppointments: IPayoutAppointmentAllocation[];
  grossAmount: number; // Total amount before deductions (in paise)
  commissionAmount?: number; // Platform commission if applicable (in paise)
  netAmount: number; // Amount to be paid to psychologist (in paise)
  status: "not_ready" | "eligible" | "processing" | "paid" | "failed" | "on_hold";
  provider?: string; // Payout provider (e.g., "razorpay_payouts")
  providerReference?: string; // Provider's transaction/reference ID
  manualPaymentMethod?: "bank_transfer" | "upi";
  failureReason?: string;
  holdReason?: string;
  processedBy?: Types.ObjectId; // Admin who processed the payout
  processedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const payoutAppointmentAllocationSchema = new Schema<IPayoutAppointmentAllocation>({
  appointmentId: { 
    type: Schema.Types.ObjectId, 
    ref: "Appointment", 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0,
  },
}, { _id: false });

const payoutSchema = new Schema<IPayout>(
  {
    psychologistId: { 
      type: Schema.Types.ObjectId, 
      ref: "PsychologistProfile", 
      required: true,
      index: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "PayoutBatch",
      index: true,
    },
    coveredAppointments: {
      type: [payoutAppointmentAllocationSchema],
      required: true,
    },
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["not_ready", "eligible", "processing", "paid", "failed", "on_hold"],
      default: "eligible",
      index: true,
    },
    provider: {
      type: String,
    },
    providerReference: {
      type: String,
    },
    manualPaymentMethod: {
      type: String,
      enum: ["bank_transfer", "upi"],
    },
    failureReason: {
      type: String,
    },
    holdReason: {
      type: String,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { 
    timestamps: true,
  }
);

// A completed appointment can fund exactly one payout. Failed payouts are
// retried by updating that same record, never by creating a second payout.
payoutSchema.index(
  { "coveredAppointments.appointmentId": 1 },
  { name: "appointment_payout_idempotency", unique: true },
);

// Index for efficient queries
payoutSchema.index({ psychologistId: 1, status: 1 });
payoutSchema.index({ status: 1, createdAt: -1 });

export const PayoutModel = model<IPayout>("Payout", payoutSchema);
