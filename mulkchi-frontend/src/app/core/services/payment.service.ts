import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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

  getById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/${id}`);
  }

  create(payment: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(this.baseUrl, payment);
  }

  update(payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(this.baseUrl, payment);
  }

  delete(id: string): Observable<Payment> {
    return this.http.delete<Payment>(`${this.baseUrl}/${id}`);
  }
}
