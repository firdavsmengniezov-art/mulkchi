import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import {
  CreateDiscountUsageRequest,
  DiscountUsage,
  DiscountUsageStatistics,
} from '../models/discount-usage.model';

@Injectable({
  providedIn: 'root',
})
export class DiscountUsageService {
  private readonly apiUrl = `${environment.apiUrl}/DiscountUsages`;

  constructor(
    private http: HttpClient,
    private logger: LoggingService,
  ) {}

  // Admin operations
  getDiscountUsages(
    page = 1,
    pageSize = 10,
    discountId?: string,
  ): Observable<{ items: DiscountUsage[]; totalCount: number; page: number; pageSize: number }> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (discountId) {
      url += `&discountId=${discountId}`;
    }
    return this.http.get<any>(url).pipe(catchError(this.handleError));
  }

  getDiscountUsageById(id: string): Observable<DiscountUsage> {
    return this.http.get<DiscountUsage>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createDiscountUsage(request: CreateDiscountUsageRequest): Observable<DiscountUsage> {
    return this.http.post<DiscountUsage>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  // Statistics
  getDiscountUsageStatistics(discountId?: string): Observable<DiscountUsageStatistics> {
    return this.getDiscountUsages(1, 1000, discountId).pipe(
      map((result) => {
        const usages = result.items ?? [];
        const totalUsageCount = usages.length;
        const totalDiscountAmount = usages.reduce(
          (sum, usage) => sum + (usage.discountAmount ?? 0),
          0,
        );
        const totalBookingsAmount = usages.reduce(
          (sum, usage) => sum + (usage.originalAmount ?? 0),
          0,
        );

        return {
          totalUsageCount,
          totalDiscountAmount,
          totalBookingsAmount,
          averageDiscountPerBooking:
            totalUsageCount > 0 ? totalDiscountAmount / totalUsageCount : 0,
          usageByMonth: [],
          topDiscounts: [],
        } as DiscountUsageStatistics;
      }),
      catchError(this.handleError),
    );
  }

  // User operations
  getMyDiscountUsages(): Observable<DiscountUsage[]> {
    return this.getDiscountUsages(1, 1000).pipe(
      map((result) => result.items ?? []),
      catchError(this.handleError),
    );
  }

  private handleError = (error: any): Observable<never> => {
    this.logger.error('DiscountUsageService error:', error);
    let errorMessage = 'An error occurred with discount usages';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to view discount usages';
    }

    return throwError(() => errorMessage);
  }
}
