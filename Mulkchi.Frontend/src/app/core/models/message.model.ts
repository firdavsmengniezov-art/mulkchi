export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  propertyId?: string;
  createdDate: string;
  isRead: boolean;
}
