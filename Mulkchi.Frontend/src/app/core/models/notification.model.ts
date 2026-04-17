export enum NotificationType {
  BookingRequest = 'BookingRequest',
  BookingApproved = 'BookingApproved',
  BookingDeclined = 'BookingDeclined',
  PaymentReceived = 'PaymentReceived',
  PaymentFailed = 'PaymentFailed',
  MessageReceived = 'MessageReceived',
  ReviewReceived = 'ReviewReceived',
  PropertyApproved = 'PropertyApproved',
  System = 'System'
}

export interface Notification {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  userId: string;
  createdDate: string;
  updatedDate: string;
}

export interface CreateNotificationRequest {
  titleUz: string;
  titleRu: string;
  titleEn: string;
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;
  type: NotificationType;
  actionUrl?: string;
  userId: string;
}

export interface MarkNotificationReadRequest {
  id: string;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
}
