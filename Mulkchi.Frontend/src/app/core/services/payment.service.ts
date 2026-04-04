import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Payment, 
  CreatePaymentRequest, 
  PaymentSummary, 
  PagedResult,
  PaymentStatus,
  PaymentMethod 
} from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  createPayment(request: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${environment.apiUrl}/payments`, request).pipe(
      catchError(this.handleError)
    );
  }

  getMyPayments(pagination?: { page: number; pageSize: number }): Observable<PagedResult<Payment>> {
    const params = pagination ? `?page=${pagination.page}&pageSize=${pagination.pageSize}` : '';
    return this.http.get<PagedResult<Payment>>(`${environment.apiUrl}/payments/my${params}`).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${environment.apiUrl}/payments/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentByBookingId(bookingId: string): Observable<Payment> {
    return this.http.get<Payment>(`${environment.apiUrl}/payments/booking/${bookingId}`).pipe(
      catchError(this.handleError)
    );
  }

  getPaymentSummary(): Observable<PaymentSummary> {
    return this.http.get<PaymentSummary>(`${environment.apiUrl}/payments/summary`).pipe(
      catchError(this.handleError)
    );
  }

  cancelPayment(id: string): Observable<Payment> {
    return this.http.put<Payment>(`${environment.apiUrl}/payments/${id}/cancel`, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Payment API Error:', error);
    return throwError(() => error);
  }

  getPaymentStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Pending:
        return 'Kutilmoqda';
      case PaymentStatus.Processing:
        return 'Jarayonda';
      case PaymentStatus.Completed:
        return 'To\'langan';
      case PaymentStatus.Failed:
        return 'Muvaffaqiyatsiz';
      case PaymentStatus.Refunded:
        return 'Qaytarilgan';
      case PaymentStatus.Cancelled:
        return 'Bekor qilingan';
      default:
        return status;
    }
  }

  getPaymentMethodIcon(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.Card:
        return 'credit_card';
      case PaymentMethod.Cash:
        return 'payments';
      case PaymentMethod.BankTransfer:
        return 'account_balance';
      case PaymentMethod.Payme:
        return 'smartphone';
      case PaymentMethod.Click:
        return 'touch_app';
      case PaymentMethod.Uzum:
        return 'account_balance_wallet';
      default:
        return 'payment';
    }
  }

  getPaymentMethodText(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.Card:
        return 'Plastik karta';
      case PaymentMethod.Cash:
        return 'Naqd pul';
      case PaymentMethod.BankTransfer:
        return 'Bank o\'tkazmas';
      case PaymentMethod.Payme:
        return 'Payme';
      case PaymentMethod.Click:
        return 'Click';
      case PaymentMethod.Uzum:
        return 'Uzum';
      default:
        return method;
    }
  }
}
