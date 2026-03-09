import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Booking, CreateBookingRequest, BookingWithProperty } from '../interfaces/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private apiService: ApiService) {}

  getBookings(): Observable<Booking[]> {
    return this.apiService.get<Booking[]>('/bookings', true);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.apiService.get<Booking>(`/bookings/${id}`, true);
  }

  createBooking(bookingData: CreateBookingRequest): Observable<Booking> {
    return this.apiService.post<Booking>('/bookings', bookingData, true);
  }

  updateBooking(id: string, bookingData: Partial<Booking>): Observable<Booking> {
    return this.apiService.put<Booking>(`/bookings/${id}`, bookingData, true);
  }

  deleteBooking(id: string): Observable<void> {
    return this.apiService.delete<void>(`/bookings/${id}`, true);
  }
}
