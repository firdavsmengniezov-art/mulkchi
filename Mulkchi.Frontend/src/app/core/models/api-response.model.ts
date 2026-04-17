/**
 * API Response Type Definitions
 * Barcha API javoblari uchun standart interface'lar
 */

// API xatolari uchun interface
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: string;
}

// Standart API javobi
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
}

// Paged (sahifalangan) javob
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated API Response
export interface PaginatedApiResponse<T> extends ApiResponse<PagedResponse<T>> {}

// SignalR Event Types
export interface SignalRAnnouncement {
  id: string;
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  bodyUz: string;
  bodyRu?: string;
  bodyEn?: string;
  createdDate: string;
}

export interface SignalRNotificationRead {
  id: string;
  readAt: string;
}

// HTTP Error Response
export interface HttpErrorResponse {
  status: number;
  statusText: string;
  error?: {
    message?: string;
    errors?: ApiError[];
    code?: string;
  };
}

// Form API Error
export interface FormFieldError {
  field: string;
  message: string;
  code: string;
}
