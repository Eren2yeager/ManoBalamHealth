export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  attachmentUrl?: string;
  sentAt: string;
  readAt?: string;
}
