export enum NotificationType {
  BookingRequest = 0, BookingApproved = 1, BookingRejected = 2,
  PaymentReceived = 3, NewMessage = 4, ReviewReceived = 5, SystemAlert = 6
}

export interface Notification {
  id: string;
  userId: string;
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  bodyUz: string;
  bodyRu?: string;
  bodyEn?: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  type: NotificationType;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
