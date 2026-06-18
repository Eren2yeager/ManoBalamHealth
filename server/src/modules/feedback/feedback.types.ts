export interface CreateFeedbackRequest {
  appointmentId: string;
  rating: number;
  comment?: string;
  continueWithSamePsychologist?: boolean;
}

export interface GetFeedbackListQuery {
  page?: number;
  limit?: number;
}

export interface FeedbackResponse {
  id: string;
  appointmentId: string;
  patientId: string;
  psychologistId: string;
  rating: number;
  comment?: string;
  continueWithSamePsychologist?: boolean;
  createdAt: string;
  patientName?: string;
}
