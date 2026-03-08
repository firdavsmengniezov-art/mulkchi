import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment } from '../models/payment.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payments`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<Payment>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Payment>>(this.baseUrl, { params });
  }

  create(payment: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(this.baseUrl, payment);
  }
}
