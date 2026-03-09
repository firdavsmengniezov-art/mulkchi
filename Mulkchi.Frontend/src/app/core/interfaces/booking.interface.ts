import { Property } from './property.interface';

export interface Booking {
  id: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  notes?: string;
  status: BookingStatus;
  totalPrice: number;
  createdDate: string;
  updatedDate: string;
}

export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3
}

export interface CreateBookingRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  notes?: string;
}

export interface BookingWithProperty extends Booking {
  property: Property;
}
