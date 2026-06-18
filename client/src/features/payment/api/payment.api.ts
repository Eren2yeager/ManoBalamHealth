import { axiosInstance } from "@/lib/axios";
import type { ApiSuccessResponse } from "@/types/global.types";
import type {
  CreateOrderResponse,
  CreatePaymentOrderDto,
  VerifyPaymentDto,
  VerifyPaymentResponse,
} from "../types/payment.types";

export const createPaymentOrder = async (
  payload: CreatePaymentOrderDto
): Promise<CreateOrderResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<CreateOrderResponse>>(
    "/payments/create-order",
    payload
  );
  return data.data;
};

export const verifyPayment = async (
  payload: VerifyPaymentDto
): Promise<VerifyPaymentResponse> => {
  const { data } = await axiosInstance.post<ApiSuccessResponse<VerifyPaymentResponse>>(
    "/payments/verify",
    payload
  );
  return data.data;
};
