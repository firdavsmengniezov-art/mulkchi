export type RequestType = 'Booking' | 'Inquiry' | 'ShortTermRent';
export type HomeRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed';

export interface HomeRequest {
  id: string;
  type: RequestType;
  status: HomeRequestStatus;
  checkInDate?: string;
  checkOutDate?: string;
  totalNights?: number;
  guestCount: number;
  totalPrice: number;
  message?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  guestId: string;
  hostId: string;
  propertyId: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
