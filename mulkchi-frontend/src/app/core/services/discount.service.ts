import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Discount, DiscountUsage } from '../models/discount.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/discounts`;
  private readonly usageUrl = `${environment.apiUrl}/discountusages`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<Discount>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Discount>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Discount> {
    return this.http.get<Discount>(`${this.baseUrl}/${id}`);
  }

  create(discount: Partial<Discount>): Observable<Discount> {
    return this.http.post<Discount>(this.baseUrl, discount);
  }

  update(discount: Discount): Observable<Discount> {
    return this.http.put<Discount>(this.baseUrl, discount);
  }

  delete(id: string): Observable<Discount> {
    return this.http.delete<Discount>(`${this.baseUrl}/${id}`);
  }

  getAllUsages(
    page = 1,
    pageSize = 20,
  ): Observable<PagedResult<DiscountUsage>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<DiscountUsage>>(this.usageUrl, { params });
  }

  createUsage(usage: Partial<DiscountUsage>): Observable<DiscountUsage> {
    return this.http.post<DiscountUsage>(this.usageUrl, usage);
  }
}
