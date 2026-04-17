import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingCreateDto, BookingResponse, BookingStatus, CreateBookingRequest } from '../models/booking.model';
import { PagedResult, PaginationParams } from '../models/pagination.model';
import { LoggingService } from './logging.service';

/**
 * Booking Hold Interface
 */
export interface BookingHold {
  id: string;
  propertyId: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Availability Calendar Interface
 */
export interface AvailabilityCalendar {
  year: number;
  month: number;
  propertyId: string;
  availableDates: string[];
  blockedDates: string[];
  bookedDates: string[];
}

/**
 * Signal-based Booking Agent Service
 * Manages booking state and operations using Angular Signals
 */
@Injectable({ providedIn: 'root' })
export class BookingAgent {
  private http = inject(HttpClient);
  private logger = inject(LoggingService);
  private apiUrl = `${environment.apiUrl}/bookings`;

  // ============ STATE SIGNALS ============
  private readonly _myBookings = signal<BookingResponse[]>([]);
  private readonly _hostBookings = signal<BookingResponse[]>([]);
  private readonly _allBookings = signal<BookingResponse[]>([]);
  private readonly _selectedBooking = signal<BookingResponse | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _currentHold = signal<BookingHold | null>(null);
  private readonly _availabilityCalendar = signal<AvailabilityCalendar | null>(null);

  // ============ PUBLIC READABLE SIGNALS ============
  readonly myBookings = this._myBookings.asReadonly();
  readonly hostBookings = this._hostBookings.asReadonly();
  readonly allBookings = this._allBookings.asReadonly();
  readonly selectedBooking = this._selectedBooking.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly currentHold = this._currentHold.asReadonly();
  readonly availabilityCalendar = this._availabilityCalendar.asReadonly();

  // ============ COMPUTED VALUES ============
  readonly pendingBookings = computed(() =>
    this._myBookings().filter(b => b.status === BookingStatus.Pending)
  );

  readonly confirmedBookings = computed(() =>
    this._myBookings().filter(b => b.status === BookingStatus.Confirmed)
  );

  readonly upcomingBookings = computed(() => {
    const today = new Date().toISOString();
    return this._myBookings().filter(b =>
      b.status === BookingStatus.Confirmed &&
      b.checkInDate > today
    );
  });

  readonly pastBookings = computed(() => {
    const today = new Date().toISOString();
    return this._myBookings().filter(b =>
      b.checkOutDate < today || b.status === BookingStatus.Completed
    );
  });

  readonly myBookingsCount = computed(() => this._myBookings().length);
  readonly pendingCount = computed(() => this.pendingBookings().length);
  readonly hostPendingCount = computed(() =>
    this._hostBookings().filter(b => b.status === BookingStatus.Pending).length
  );

  // ============ OBSERVABLE INTEROP ============
  myBookings$ = toObservable(this._myBookings);
  hostBookings$ = toObservable(this._hostBookings);
  selectedBooking$ = toObservable(this._selectedBooking);

  // ============ CRUD OPERATIONS ============

  /**
   * Get all bookings (Admin only)
   */
  getAllBookings(params?: PaginationParams): Observable<PagedResult<BookingResponse>> {
    this._loading.set(true);
    const query = this.buildQueryString(params);
    return this.http.get<PagedResult<BookingResponse>>(`${this.apiUrl}${query}`).pipe(
      tap(result => {
        this._allBookings.set(result.items);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Get my bookings (Guest)
   */
  getMyBookings(params?: PaginationParams): Observable<PagedResult<BookingResponse>> {
    this._loading.set(true);
    const query = this.buildQueryString(params);
    return this.http.get<PagedResult<BookingResponse>>(`${this.apiUrl}/my${query}`).pipe(
      tap(result => {
        this._myBookings.set(result.items);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Get host bookings (Host/Admin)
   */
  getHostBookings(params?: PaginationParams): Observable<PagedResult<BookingResponse>> {
    this._loading.set(true);
    const query = this.buildQueryString(params);
    return this.http.get<PagedResult<BookingResponse>>(`${this.apiUrl}/host${query}`).pipe(
      tap(result => {
        this._hostBookings.set(result.items);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Get booking by ID
   */
  getBookingById(id: string): Observable<BookingResponse> {
    this._loading.set(true);
    return this.http.get<BookingResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(booking => {
        this._selectedBooking.set(booking);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Create new booking
   */
  createBooking(data: CreateBookingRequest): Observable<BookingResponse> {
    this._loading.set(true);
    const dto: BookingCreateDto = {
      propertyId: data.propertyId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guestsCount: data.guestsCount,
      totalPrice: 0, // Calculated by backend
      message: data.notes
    };

    return this.http.post<BookingResponse>(this.apiUrl, dto).pipe(
      tap(booking => {
        this._myBookings.update(bookings => [booking, ...bookings]);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Confirm booking (Host/Admin only)
   */
  confirmBooking(id: string): Observable<BookingResponse> {
    this._loading.set(true);
    return this.http.post<BookingResponse>(`${this.apiUrl}/${id}/confirm`, {}).pipe(
      tap(booking => {
        this.updateBookingInState(booking);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Cancel booking
   */
  cancelBooking(id: string, reason?: string): Observable<BookingResponse> {
    this._loading.set(true);
    return this.http.post<BookingResponse>(`${this.apiUrl}/${id}/cancel`, { reason }).pipe(
      tap(booking => {
        this.updateBookingInState(booking);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Update booking
   */
  updateBooking(id: string, data: Partial<Booking>): Observable<BookingResponse> {
    this._loading.set(true);
    return this.http.put<BookingResponse>(`${this.apiUrl}/${id}`, data).pipe(
      tap(booking => {
        this.updateBookingInState(booking);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Delete booking
   */
  deleteBooking(id: string): Observable<void> {
    this._loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._myBookings.update(bookings => bookings.filter(b => b.id !== id));
        this._hostBookings.update(bookings => bookings.filter(b => b.id !== id));
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ============ AVAILABILITY & HOLD OPERATIONS ============

  /**
   * Get property availability calendar
   */
  getPropertyAvailability(
    propertyId: string,
    year: number,
    month: number
  ): Observable<AvailabilityCalendar> {
    return this.http.get<AvailabilityCalendar>(
      `${this.apiUrl}/availability/${propertyId}?year=${year}&month=${month}`
    ).pipe(
      tap(calendar => {
        this._availabilityCalendar.set(calendar);
      }),
      catchError(err => {
        this._error.set(err.message);
        return throwError(() => err);
      })
    );
  }

  /**
   * Create temporary hold (10 minutes)
   */
  createHold(propertyId: string, checkInDate: string, checkOutDate: string): Observable<BookingHold> {
    return this.http.post<BookingHold>(`${this.apiUrl}/hold`, {
      propertyId,
      checkInDate,
      checkOutDate
    }).pipe(
      tap(hold => {
        this._currentHold.set(hold);
      }),
      catchError(err => {
        this._error.set(err.message);
        return throwError(() => err);
      })
    );
  }

  /**
   * Release hold
   */
  releaseHold(holdId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/hold/${holdId}`).pipe(
      tap(() => {
        this._currentHold.set(null);
      }),
      catchError(err => {
        this._error.set(err.message);
        return throwError(() => err);
      })
    );
  }

  // ============ STATE MANAGEMENT ============

  setSelectedBooking(booking: BookingResponse | null): void {
    this._selectedBooking.set(booking);
  }

  clearError(): void {
    this._error.set(null);
  }

  clearHold(): void {
    this._currentHold.set(null);
  }

  // ============ PRIVATE HELPERS ============

  private updateBookingInState(updatedBooking: BookingResponse): void {
    this._myBookings.update(bookings =>
      bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b)
    );
    this._hostBookings.update(bookings =>
      bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b)
    );
    this._allBookings.update(bookings =>
      bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b)
    );

    if (this._selectedBooking()?.id === updatedBooking.id) {
      this._selectedBooking.set(updatedBooking);
    }
  }

  private buildQueryString(params?: PaginationParams): string {
    if (!params) return '';
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return query ? `?${query}` : '';
  }
}
