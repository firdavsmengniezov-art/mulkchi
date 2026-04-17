import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationParams, PagedResult } from '../models/pagination.model';
import { CreatePaymentRequest, Payment, PaymentMethod, PaymentStatus, PaymentSummary } from '../models/payment.models';
import { LoggingService } from './logging.service';

/**
 * Payme Payment Request
 */
export interface PaymePaymentRequest {
  id: string;
  method: 'payme';
  params: {
    account: { bookingId: string };
    amount: number;
  };
}

/**
 * Click Payment Request
 */
export interface ClickPaymentRequest {
  service_id: string;
  merchant_trans_id: string;
  amount: number;
  transaction_param: string;
  return_url: string;
}

/**
 * Signal-based Payment Agent Service
 * Manages payment state and operations using Angular Signals
 */
@Injectable({ providedIn: 'root' })
export class PaymentAgent {
  private http = inject(HttpClient);
  private logger = inject(LoggingService);
  private apiUrl = `${environment.apiUrl}/payments`;

  // ============ STATE SIGNALS ============
  private readonly _myPayments = signal<Payment[]>([]);
  private readonly _allPayments = signal<Payment[]>([]);
  private readonly _selectedPayment = signal<Payment | null>(null);
  private readonly _paymentSummary = signal<PaymentSummary | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _pendingPaymentUrl = signal<string | null>(null);

  // ============ PUBLIC READABLE SIGNALS ============
  readonly myPayments = this._myPayments.asReadonly();
  readonly allPayments = this._allPayments.asReadonly();
  readonly selectedPayment = this._selectedPayment.asReadonly();
  readonly paymentSummary = this._paymentSummary.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly pendingPaymentUrl = this._pendingPaymentUrl.asReadonly();

  // ============ COMPUTED VALUES ============
  readonly pendingPayments = computed(() =>
    this._myPayments().filter(p => p.status === PaymentStatus.Pending)
  );

  readonly completedPayments = computed(() =>
    this._myPayments().filter(p => p.status === PaymentStatus.Completed)
  );

  readonly totalPaidAmount = computed(() =>
    this._myPayments()
      .filter(p => p.status === PaymentStatus.Completed && p.payerId === this.getCurrentUserId())
      .reduce((sum, p) => sum + p.amount, 0)
  );

  readonly totalReceivedAmount = computed(() =>
    this._myPayments()
      .filter(p => p.status === PaymentStatus.Completed && p.receiverId === this.getCurrentUserId())
      .reduce((sum, p) => sum + p.hostReceives, 0)
  );

  readonly pendingCount = computed(() => this.pendingPayments().length);
  readonly myPaymentsCount = computed(() => this._myPayments().length);

  // ============ OBSERVABLE INTEROP ============
  myPayments$ = toObservable(this._myPayments);
  allPayments$ = toObservable(this._allPayments);
  selectedPayment$ = toObservable(this._selectedPayment);
  paymentSummary$ = toObservable(this._paymentSummary);

  // ============ CRUD OPERATIONS ============

  /**
   * Get all payments (Admin only)
   */
  getAllPayments(params?: PaginationParams): Observable<PagedResult<Payment>> {
    this._loading.set(true);
    const query = this.buildQueryString(params);
    return this.http.get<PagedResult<Payment>>(`${this.apiUrl}${query}`).pipe(
      tap(result => {
        this._allPayments.set(result.items);
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
   * Get my payments
   */
  getMyPayments(params?: PaginationParams): Observable<PagedResult<Payment>> {
    this._loading.set(true);
    const query = this.buildQueryString(params);
    return this.http.get<PagedResult<Payment>>(`${this.apiUrl}/my${query}`).pipe(
      tap(result => {
        this._myPayments.set(result.items);
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
   * Get payment by ID
   */
  getPaymentById(id: string): Observable<Payment> {
    this._loading.set(true);
    return this.http.get<Payment>(`${this.apiUrl}/${id}`).pipe(
      tap(payment => {
        this._selectedPayment.set(payment);
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
   * Get payment by booking ID
   */
  getPaymentByBookingId(bookingId: string): Observable<Payment> {
    this._loading.set(true);
    return this.http.get<Payment>(`${this.apiUrl}/booking/${bookingId}`).pipe(
      tap(payment => {
        this._selectedPayment.set(payment);
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
   * Get payment summary
   */
  getPaymentSummary(): Observable<PaymentSummary> {
    return this.http.get<PaymentSummary>(`${this.apiUrl}/summary`).pipe(
      tap(summary => {
        this._paymentSummary.set(summary);
      }),
      catchError(err => {
        this._error.set(err.message);
        return throwError(() => err);
      })
    );
  }

  /**
   * Create payment (initiates payment process)
   */
  createPayment(data: CreatePaymentRequest): Observable<Payment> {
    this._loading.set(true);
    return this.http.post<Payment>(this.apiUrl, data).pipe(
      tap(payment => {
        if (payment.paymentUrl) {
          this._pendingPaymentUrl.set(payment.paymentUrl);
        }
        this._myPayments.update(payments => [payment, ...payments]);
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
   * Update payment (Admin only)
   */
  updatePayment(id: string, data: Partial<Payment>): Observable<Payment> {
    this._loading.set(true);
    return this.http.put<Payment>(`${this.apiUrl}/${id}`, data).pipe(
      tap(payment => {
        this.updatePaymentInState(payment);
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
   * Cancel payment
   */
  cancelPayment(id: string, reason?: string): Observable<Payment> {
    this._loading.set(true);
    return this.http.put<Payment>(`${this.apiUrl}/${id}/cancel`, { reason }).pipe(
      tap(payment => {
        this.updatePaymentInState(payment);
        this._pendingPaymentUrl.set(null);
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
   * Delete payment (Admin only)
   */
  deletePayment(id: string): Observable<void> {
    this._loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._myPayments.update(payments => payments.filter(p => p.id !== id));
        this._allPayments.update(payments => payments.filter(p => p.id !== id));
        if (this._selectedPayment()?.id === id) {
          this._selectedPayment.set(null);
        }
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ============ PAYMENT PROVIDER INTEGRATION ============

  /**
   * Initiate Payme payment
   */
  initiatePaymePayment(bookingId: string, amount: number): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${environment.apiUrl}/payme/create`, {
      bookingId,
      amount
    }).pipe(
      tap(response => {
        this._pendingPaymentUrl.set(response.url);
      }),
      catchError(err => {
        this._error.set(err.message);
        return throwError(() => err);
      })
    );
  }

  /**
   * Initiate Click payment
   */
  initiateClickPayment(bookingId: string, amount: number): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${environment.apiUrl}/click/create`, {
      bookingId,
      amount
    }).pipe(
      tap(response => {
        this._pendingPaymentUrl.set(response.url);
      }),
      catchError(err => {
        this._error.set(err.message);
        return throwError(() => err);
      })
    );
  }

  /**
   * Verify payment status
   */
  verifyPayment(paymentId: string, provider: 'payme' | 'click'): Observable<Payment> {
    this._loading.set(true);
    const endpoint = provider === 'payme' ? 'payme/verify' : 'click/verify';
    return this.http.post<Payment>(`${environment.apiUrl}/${endpoint}`, { paymentId }).pipe(
      tap(payment => {
        this.updatePaymentInState(payment);
        if (payment.status === PaymentStatus.Completed) {
          this._pendingPaymentUrl.set(null);
        }
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ============ STATE MANAGEMENT ============

  setSelectedPayment(payment: Payment | null): void {
    this._selectedPayment.set(payment);
  }

  clearPendingPaymentUrl(): void {
    this._pendingPaymentUrl.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  // ============ PRIVATE HELPERS ============

  private updatePaymentInState(updatedPayment: Payment): void {
    this._myPayments.update(payments =>
      payments.map(p => p.id === updatedPayment.id ? updatedPayment : p)
    );
    this._allPayments.update(payments =>
      payments.map(p => p.id === updatedPayment.id ? updatedPayment : p)
    );

    if (this._selectedPayment()?.id === updatedPayment.id) {
      this._selectedPayment.set(updatedPayment);
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

  private getCurrentUserId(): string {
    // This would typically come from AuthService
    return '';
  }
}
