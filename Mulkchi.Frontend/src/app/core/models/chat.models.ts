export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdDate: string;
  updatedDate: string;
  timestamp?: string;
}

export interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}
