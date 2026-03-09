export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  rating: number;
  comment: string;
  createdDate: string;
  updatedDate: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  propertyId?: string;
  createdDate: string;
  updatedDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdDate: string;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdDate: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdDate: string;
}

export enum PaymentMethod {
  Cash = 0,
  Card = 1,
  BankTransfer = 2,
  Click = 3,
  Payme = 4
}

export enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Refunded = 3
}
