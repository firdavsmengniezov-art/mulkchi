import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Booking,
  BookingResponse,
  BookingStatus,
  CreateBookingRequest,
  PagedResult,
} from '../models';
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private logger: LoggingService,
  ) {}

  // Get all bookings (admin)
  getBookings(page: number = 1, pageSize: number = 10): Observable<PagedResult<Booking>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<PagedResult<Booking>>(`${this.apiUrl}/bookings`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get current user's bookings
  getMyBookings(page: number = 1, pageSize: number = 10): Observable<PagedResult<Booking>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<PagedResult<Booking>>(`${this.apiUrl}/bookings/my`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get host's bookings
  getHostBookings(page: number = 1, pageSize: number = 10): Observable<PagedResult<Booking>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<PagedResult<Booking>>(`${this.apiUrl}/bookings/host`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get booking by ID
  getBookingById(id: string): Observable<Booking> {
    return this.http
      .get<Booking>(`${this.apiUrl}/bookings/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Create new booking
  createBooking(req: CreateBookingRequest): Observable<BookingResponse> {
    return this.http
      .post<BookingResponse>(`${this.apiUrl}/bookings`, req)
      .pipe(catchError(this.handleError));
  }

  // Confirm booking (host only)
  confirmBooking(id: string): Observable<Booking> {
    return this.http
      .post<Booking>(`${this.apiUrl}/bookings/${id}/confirm`, {})
      .pipe(catchError(this.handleError));
  }

  // Cancel booking
  cancelBooking(id: string): Observable<Booking> {
    return this.http
      .post<Booking>(`${this.apiUrl}/bookings/${id}/cancel`, {})
      .pipe(catchError(this.handleError));
  }

  // Update booking
  updateBooking(booking: Booking): Observable<Booking> {
    return this.http
      .put<Booking>(`${this.apiUrl}/bookings`, booking)
      .pipe(catchError(this.handleError));
  }

  // Delete booking
  deleteBooking(id: string): Observable<Booking> {
    return this.http
      .delete<Booking>(`${this.apiUrl}/bookings/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError = (error: HttpErrorResponse) => {
    this.logger.error('Booking API Error:', error);
    return throwError(() => error);
  }

  // Utility methods
  getBookingStatusText(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.Pending:
        return 'Kutilmoqda';
      case BookingStatus.Confirmed:
        return 'Tasdiqlangan';
      case BookingStatus.Cancelled:
        return 'Bekor qilingan';
      case BookingStatus.Completed:
        return 'Tugatilgan';
      default:
        return "Noma'lum";
    }
  }

  getBookingStatusColor(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.Pending:
        return 'orange';
      case BookingStatus.Confirmed:
        return 'green';
      case BookingStatus.Cancelled:
        return 'red';
      case BookingStatus.Completed:
        return 'blue';
      default:
        return 'gray';
    }
  }

  // Calculate total price
  calculateTotalPrice(checkInDate: string, checkOutDate: string, pricePerNight: number): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * pricePerNight;
  }

  // Check if booking can be cancelled
  canCancelBooking(status: BookingStatus): boolean {
    return status === BookingStatus.Pending || status === BookingStatus.Confirmed;
  }

  // Check if booking can be confirmed
  canConfirmBooking(status: BookingStatus): boolean {
    return status === BookingStatus.Pending;
  }

  getBlockedDates(propertyId: string, year: number, month: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/bookings/availability/${propertyId}`, {
      params: { year, month },
    });
  }

  createPropertyBooking(dto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings`, dto).pipe(catchError(this.handleError));
  }
}
