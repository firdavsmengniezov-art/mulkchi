import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import { 
  DiscountUsage, 
  CreateDiscountUsageRequest,
  DiscountUsageStatistics 
} from '../models/discount-usage.model';

@Injectable({
  providedIn: 'root'
})
export class DiscountUsageService {
  private readonly apiUrl = `${environment.apiUrl}/discount-usages`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  // Admin operations
  getDiscountUsages(page = 1, pageSize = 10, discountId?: string): Observable<{ items: DiscountUsage[]; totalCount: number; page: number; pageSize: number }> {
    let url = `${this.apiUrl}?page=${page}&pageSize=${pageSize}`;
    if (discountId) {
      url += `&discountId=${discountId}`;
    }
    return this.http.get<any>(url).pipe(
      catchError(this.handleError)
    );
  }

  getDiscountUsageById(id: string): Observable<DiscountUsage> {
    return this.http.get<DiscountUsage>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createDiscountUsage(request: CreateDiscountUsageRequest): Observable<DiscountUsage> {
    return this.http.post<DiscountUsage>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  // Statistics
  getDiscountUsageStatistics(discountId?: string): Observable<DiscountUsageStatistics> {
    let url = `${this.apiUrl}/statistics`;
    if (discountId) {
      url += `?discountId=${discountId}`;
    }
    return this.http.get<DiscountUsageStatistics>(url).pipe(
      catchError(this.handleError)
    );
  }

  // User operations
  getMyDiscountUsages(): Observable<DiscountUsage[]> {
    return this.http.get<DiscountUsage[]>(`${this.apiUrl}/my`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
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
