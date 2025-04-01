// models/Message.ts
import { ObjectId, Schema, model } from 'mongoose';

export interface IMessage {
  _id: ObjectId;
  content: string;
  sender: ObjectId;
  receiver: ObjectId;
  read: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const MessageModel = model<IMessage>('Message', messageSchema);