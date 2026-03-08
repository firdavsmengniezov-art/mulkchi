export type MessageType = 'Text' | 'Image' | 'File' | 'System';

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  isRead: boolean;
  readAt?: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  homeRequestId?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
