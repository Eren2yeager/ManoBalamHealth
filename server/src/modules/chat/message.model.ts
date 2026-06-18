import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  sessionId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  attachmentUrl?: string;
  sentAt: Date;
  readAt?: Date;
}

const messageSchema = new Schema<IMessage>({
  sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  attachmentUrl: { type: String },
  sentAt: { type: Date, default: Date.now },
  readAt: { type: Date },
});

export const MessageModel = model<IMessage>("Message", messageSchema);
