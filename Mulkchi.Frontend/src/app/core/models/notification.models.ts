export interface Notification {
  id: string;
  userId: string;
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
  createdDate: string;
  updatedDate: string;
  timestamp?: string;
}

export enum NotificationType {
  BookingCreated = 'BookingCreated',
  BookingConfirmed = 'BookingConfirmed',
  BookingCancelled = 'BookingCancelled',
  NewMessage = 'NewMessage',
  ReviewReceived = 'ReviewReceived',
  PaymentReceived = 'PaymentReceived',
  PropertyApproved = 'PropertyApproved',
  SystemAlert = 'SystemAlert',
  Info = 'Info'
}

export interface NotificationSummary {
  total: number;
  unreadCount: number;
  notifications: Notification[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
