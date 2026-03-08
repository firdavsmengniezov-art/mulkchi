export enum MessageType { Text = 0, Image = 1, File = 2, System = 3 }

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
