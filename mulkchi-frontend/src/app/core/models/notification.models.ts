export type NotificationType =
  | 'BookingRequest'
  | 'BookingApproved'
  | 'BookingRejected'
  | 'PaymentReceived'
  | 'NewMessage'
  | 'ReviewReceived'
  | 'SystemAlert';

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
