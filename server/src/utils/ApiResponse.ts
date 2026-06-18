export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export class ApiResponse {
  static success<T>(
    data: T,
    message = "Success",
    meta?: ApiSuccessResponse<T>["meta"]
  ): ApiSuccessResponse<T> {
    return { success: true, message, data, ...(meta && { meta }) };
  }
}
