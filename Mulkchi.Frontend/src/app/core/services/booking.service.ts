import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, CreateBookingRequest, PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  
  constructor(private http: HttpClient) {}

  getBookings(): Observable<PagedResult<Booking>> { 
    return this.http.get<PagedResult<Booking>>(this.apiUrl); 
  }

  createBooking(req: CreateBookingRequest): Observable<Booking> { 
    return this.http.post<Booking>(this.apiUrl, req); 
  }

  cancelBooking(id: string): Observable<void> { 
    return this.http.delete<void>(`${this.apiUrl}/${id}`); 
  }
}
