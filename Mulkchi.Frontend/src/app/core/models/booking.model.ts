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
  isInstantBook: boolean;
  notes?: string;
  createdDate: string;
  updatedDate: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  propertyId: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  isInstantBook: boolean;
  notes?: string;
  createdDate: string;
  updatedDate: string;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    pricePerNight?: number;
    monthlyRent?: number;
    salePrice?: number;
    isInstantBook: boolean;
  };
}
