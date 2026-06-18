import { Schema, model, Document, Types } from "mongoose";

export interface IFeedback extends Document {
  appointmentId: Types.ObjectId;
  patientId: Types.ObjectId;
  psychologistId: Types.ObjectId;
  rating: number;
  comment?: string;
  continueWithSamePsychologist?: boolean;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    psychologistId: {
      type: Schema.Types.ObjectId,
      ref: "PsychologistProfile",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    continueWithSamePsychologist: {
      type: Boolean,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const FeedbackModel = model<IFeedback>("Feedback", feedbackSchema);
