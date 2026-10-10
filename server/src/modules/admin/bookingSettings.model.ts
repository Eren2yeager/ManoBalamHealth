import { Schema, model, Document, Types } from "mongoose";

export interface IBookingSettings extends Document {
  key: "booking";
  showScheduleSelection: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSettingsSchema = new Schema<IBookingSettings>(
  {
    key: { type: String, enum: ["booking"], required: true, unique: true, default: "booking" },
    showScheduleSelection: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const BookingSettingsModel = model<IBookingSettings>("BookingSettings", bookingSettingsSchema);
