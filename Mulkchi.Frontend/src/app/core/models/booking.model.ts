import { Property } from './property.model';

export enum BookingStatus { Pending='Pending', Confirmed='Confirmed', Cancelled='Cancelled', Completed='Completed' }

export interface Booking {
  id: string;
  propertyId: string;
  property?: Property;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  notes?: string;
}
