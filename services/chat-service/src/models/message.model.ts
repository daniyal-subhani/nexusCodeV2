import { Schema, Document, model } from 'mongoose';

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO';

export interface IAttachment {
  url: string;
  fileType?: string;
  fileSize?: string;
  fileName?: string;
}

export interface IMessage extends Document {
  conversationId: string;
  senderId: string; // auth / user service se ayi hui id
  content: string;
  type: MessageType;
  attachments: IAttachment[];
  readBy: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    fileType: { type: String },
    fileSize: { type: String },
    fileName: { type: String },
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'FILE', 'AUDIO'],
      default: 'TEXT',
      required: true,
    },
    attachments: [attachmentSchema],
    readBy: [{ type: String }],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

export const Message = model<IMessage>('Message', messageSchema);
