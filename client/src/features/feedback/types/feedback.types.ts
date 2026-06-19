
export interface SubmitFeedbackDto {
  appointmentId: string;
  rating: number;
  comment?: string;
  continueWithSamePsychologist?: boolean;
}

export interface PsychologistFeedbackItem {
  rating: number;
  comment?: string;
  patientName: string;
  createdAt: string;
}