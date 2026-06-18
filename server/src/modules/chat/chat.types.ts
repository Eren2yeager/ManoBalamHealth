export interface ChatMessageResponse {
  id: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  sentAt: string;
  readAt?: string;
}

export interface GetChatHistoryQuery {
  page?: number;
  limit?: number;
}
