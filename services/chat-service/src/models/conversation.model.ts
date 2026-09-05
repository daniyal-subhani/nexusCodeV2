import { Schema, Document, model } from 'mongoose';

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';

export interface ILastMessage {
  messageId?: string;
  senderId: string;
  content: string;
  type: MessageType;
  sentAt: Date;
}

export interface IConversation extends Document {
  isGroup: boolean;
  name?: string;
  groupAvatar?: string;
  adminIds: string[];
  participants: string[];
  lastMessage?: ILastMessage;
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const lastMessageSchema = new Schema<ILastMessage>(
  {
    messageId: {
      type: String,
    },
    senderId: { type: String, required: true },
    content: { type: String, required: true, default: '' },
    type: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'FILE', 'AUDIO'],
      default: 'TEXT',
      required: true,
    },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const conversationSchema = new Schema<IConversation>(
  {
    isGroup: {
      type: Boolean,
      default: false,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    groupAvatar: {
      type: String,
    },
    adminIds: [{ type: String }],
    participants: [
      {
        type: String,
        required: true,
        index: true,
      },
    ],
    lastMessage: lastMessageSchema,
    // tracks unread messages count per user using mongoose map type
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
