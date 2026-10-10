import { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/global.types";
import { ErrorCodes } from "@/types/global.types";

export const getBookingErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiErrorResponse | undefined;
    const code = apiError?.code;

    if (code === ErrorCodes.NO_PSYCHOLOGIST_AVAILABLE) {
      return "We couldn't find an available psychologist for your preferred time. Try a different time window or specialization.";
    }

    if (code === ErrorCodes.SLOT_ALREADY_BOOKED) {
      return "That time slot was just booked by someone else. Please go back and pick another slot.";
    }

    if (code === ErrorCodes.PSYCHOLOGIST_NOT_VERIFIED) {
      return "The matched psychologist is not available for booking yet. Please try a different time window.";
    }

    if (apiError?.message) {
      return apiError.message;
    }
  }

  return "Something went wrong while creating your booking. Please try again.";
};
