import { ContactRequestModel } from "./contact.model";
import type { CreateContactRequest } from "./contact.types";

class ContactService {
  async createRequest(data: CreateContactRequest): Promise<{ id: string }> {
    const request = await ContactRequestModel.create({
      ...data,
      phone: data.phone || undefined,
    });
    return { id: request._id.toString() };
  }
}

export const contactService = new ContactService();

