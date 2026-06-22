import { axiosInstance } from "@/lib/axios";

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
}

export async function submitContactRequest(payload: ContactRequest): Promise<void> {
  await axiosInstance.post("/contact", payload);
}

