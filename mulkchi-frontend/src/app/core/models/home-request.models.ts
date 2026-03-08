export enum RequestType { Booking = 0, Inquiry = 1, ShortTermRent = 2 }
export enum RequestStatus { Pending = 0, Approved = 1, Rejected = 2, Cancelled = 3, Completed = 4 }
/** @deprecated use RequestStatus */
export type HomeRequestStatus = RequestStatus;

export interface HomeRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
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
