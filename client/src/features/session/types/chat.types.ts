export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  sentAt: string;
  readAt?: string;
}