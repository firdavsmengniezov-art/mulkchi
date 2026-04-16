import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';
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
  constructor(private http: HttpClient,
    private logger: LoggingService) {}

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

  /**
   * Initiate a Payme payment by creating a payment record and returning the Payme checkout URL.
   * The checkout URL format: https://checkout.paycom.uz/{base64(m=<merchantId>;ac.order_id=<paymentId>;a=<amountTiyin>)}
   */
  initiatePaymePayment(paymentId: string, amountUzs: number, merchantId: string): string {
    const amountTiyin = Math.round(amountUzs * 100);
    const params = `m=${merchantId};ac.order_id=${paymentId};a=${amountTiyin}`;
    const encoded = btoa(params);
    return `https://checkout.paycom.uz/${encoded}`;
  }

  /**
   * Initiate a Click payment by redirecting to the Click checkout page.
   * URL format: https://my.click.uz/services/pay?service_id=<sid>&merchant_id=<mid>&amount=<amount>&transaction_param=<paymentId>
   * NOTE: returnUrl must be a trusted origin from your own application.
   */
  initiateClickPayment(
    paymentId: string,
    amountUzs: number,
    serviceId: string,
    merchantId: string,
    returnUrl: string
  ): string {
    // Only allow relative paths or same-origin URLs as return URLs
    const safeReturnUrl = returnUrl.startsWith('/') ? returnUrl : '/';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      service_id: serviceId,
      merchant_id: merchantId,
      amount: amountUzs.toString(),
      transaction_param: paymentId,
      return_url: origin + safeReturnUrl,
    });
    return `https://my.click.uz/services/pay?${params.toString()}`;
  }

  private handleError = (error: HttpErrorResponse) => {
    this.logger.error('Payment API Error:', error);
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
