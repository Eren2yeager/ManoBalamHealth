import { Schema, model, Document, Types } from "mongoose";

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  psychologistId: Types.ObjectId;
  slotId?: Types.ObjectId;
  allocationMode: "manual" | "auto" | "emergency";
  mode: "chat" | "audio" | "video";
  concernDescription?: string;
  status: "pending_payment" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show" | "refunded";
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  paymentId?: Types.ObjectId;
  cancellationReason?: string;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    psychologistId: { type: Schema.Types.ObjectId, ref: "PsychologistProfile", required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: "AvailabilitySlot" },
    allocationMode: { type: String, enum: ["manual", "auto", "emergency"], required: true },
    mode: { type: String, enum: ["chat", "audio", "video"], required: true },
    concernDescription: { type: String },
    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "in_progress", "completed", "cancelled", "no_show", "refunded"],
      default: "pending_payment",
      index: true,
    },
    refundReason: { type: String },
    scheduledAt: { type: Date, required: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

export const AppointmentModel = model<IAppointment>("Appointment", appointmentSchema);
