export enum MessageType {
  Text = 'Text',
  Image = 'Image',
  File = 'File',
  Location = 'Location',
  Contact = 'Contact'
}

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
}

export interface CreateMessageRequest {
  content: string;
  type?: MessageType;
  receiverId: string;
  propertyId?: string;
  homeRequestId?: string;
}

export interface UpdateMessageRequest {
  id: string;
  content?: string;
  isRead?: boolean;
}

export interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}
