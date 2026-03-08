export type HomeRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed';

export interface HomeRequest {
  id: string;
  propertyId: string;
  guestId: string;
  hostId: string;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  totalPrice: number;
  guestCount: number;
  status: HomeRequestStatus;
  message?: string;
  createdDate: string;
  updatedDate: string;
}
