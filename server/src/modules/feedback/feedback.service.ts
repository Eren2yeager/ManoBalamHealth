import { Types } from "mongoose";
import { FeedbackModel } from "./feedback.model";
import { AppointmentModel } from "@/modules/appointment/appointment.model";
import { PsychologistModel } from "@/modules/psychologist/psychologist.model";
import { UserModel } from "@/modules/user/user.model";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "@/constants/statusCodes.constant";
import { ErrorCodes } from "@/constants/errorCodes.constant";
import { CreateFeedbackRequest, FeedbackResponse, GetFeedbackListQuery } from "./feedback.types";

class FeedbackService {
  async createFeedback(
    patientUserId: string,
    data: CreateFeedbackRequest
  ): Promise<{ id: string }> {
    // Check if appointment exists
    const appointment = await AppointmentModel.findById(data.appointmentId);
    if (!appointment) {
      throw new ApiError(StatusCodes.NOT_FOUND, ErrorCodes.NOT_FOUND, "Appointment not found");
    }

    // Check if appointment belongs to the patient
    if (appointment.patientId.toString() !== patientUserId) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        ErrorCodes.FORBIDDEN_ROLE,
        "You are not authorized to submit feedback for this appointment"
      );
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Feedback can only be submitted for completed appointments"
      );
    }

    // Check if feedback already exists for this appointment
    const existingFeedback = await FeedbackModel.findOne({
      appointmentId: appointment._id,
    });
    if (existingFeedback) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        ErrorCodes.VALIDATION_ERROR,
        "Feedback already submitted for this appointment"
      );
    }

    // Create feedback
    const feedback = await FeedbackModel.create({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      psychologistId: appointment.psychologistId,
      rating: data.rating,
      comment: data.comment,
      continueWithSamePsychologist: data.continueWithSamePsychologist,
    });

    // Update psychologist's rating
    await this.updatePsychologistRating(appointment.psychologistId);

    return { id: feedback._id.toString() };
  }

  private async updatePsychologistRating(psychologistId: Types.ObjectId): Promise<void> {
    // Calculate average rating and count
    const result = await FeedbackModel.aggregate([
      { $match: { psychologistId } },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      const { average, count } = result[0];
      await PsychologistModel.findByIdAndUpdate(psychologistId, {
        "rating.average": Math.round(average * 10) / 10, // Round to 1 decimal place
        "rating.count": count,
      });
    }
  }

  async getPsychologistFeedback(
    psychologistId: string,
    query: GetFeedbackListQuery
  ): Promise<{
    data: FeedbackResponse[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const skip = (page - 1) * limit;

    // Get feedback with patient user details
    const feedbackDocs = await FeedbackModel.find({
      psychologistId: new Types.ObjectId(psychologistId),
    })
      .populate("patientId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FeedbackModel.countDocuments({
      psychologistId: new Types.ObjectId(psychologistId),
    });

    const totalPages = Math.ceil(total / limit);

    const data: FeedbackResponse[] = feedbackDocs.map((feedback) => ({
      id: feedback._id.toString(),
      appointmentId: feedback.appointmentId.toString(),
      patientId: feedback.patientId.toString(),
      psychologistId: feedback.psychologistId.toString(),
      rating: feedback.rating,
      comment: feedback.comment,
      continueWithSamePsychologist: feedback.continueWithSamePsychologist,
      createdAt: feedback.createdAt.toISOString(),
      patientName: (feedback.patientId as any)?.name || "Anonymous",
    }));

    return { data, meta: { page, limit, total, totalPages } };
  }
}

export const feedbackService = new FeedbackService();
