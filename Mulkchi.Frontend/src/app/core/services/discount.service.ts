import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import { 
  Discount, 
  CreateDiscountRequest, 
  UpdateDiscountRequest,
  DiscountValidationRequest,
  DiscountValidationResponse
} from '../models/discount.model';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {
  private readonly apiUrl = `${environment.apiUrl}/discounts`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  // Admin CRUD operations
  getDiscounts(page = 1, pageSize = 10): Observable<{ items: Discount[]; totalCount: number; page: number; pageSize: number }> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  getActiveDiscounts(): Observable<Discount[]> {
    return this.http.get<Discount[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError)
    );
  }

  getDiscountById(id: string): Observable<Discount> {
    return this.http.get<Discount>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createDiscount(request: CreateDiscountRequest): Observable<Discount> {
    return this.http.post<Discount>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  updateDiscount(request: UpdateDiscountRequest): Observable<Discount> {
    return this.http.put<Discount>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteDiscount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  toggleDiscountStatus(id: string, isActive: boolean): Observable<Discount> {
    return this.updateDiscount({
      id,
      isActive
    });
  }

  // Discount validation for client side
  validateDiscount(request: DiscountValidationRequest): Observable<DiscountValidationResponse> {
    return this.http.post<DiscountValidationResponse>(`${this.apiUrl}/validate`, request).pipe(
      catchError(this.handleError)
    );
  }

  // Calculate discount amount
  calculateDiscount(discount: Discount, bookingAmount: number): number {
    if (discount.discountType === 'Percentage') {
      const discountAmount = (bookingAmount * discount.discountValue) / 100;
      
      // Apply max discount limit if set
      if (discount.maxDiscountAmount) {
        return Math.min(discountAmount, discount.maxDiscountAmount);
      }
      
      return discountAmount;
    } else {
      // Fixed amount discount
      return Math.min(discount.discountValue, bookingAmount);
    }
  }

  // Check if discount is applicable
  isDiscountApplicable(discount: Discount, request: DiscountValidationRequest): boolean {
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validUntil = new Date(discount.validUntil);

    // Check date validity
    if (now < validFrom || now > validUntil) {
      return false;
    }

    // Check if discount is active
    if (!discount.isActive) {
      return false;
    }

    // Check usage limit
    if (discount.maxUsageCount && discount.currentUsageCount >= discount.maxUsageCount) {
      return false;
    }

    // Check minimum booking amount
    if (discount.minBookingAmount && request.bookingAmount < discount.minBookingAmount) {
      return false;
    }

    // Check minimum booking days
    if (discount.minBookingDays && request.bookingDays && request.bookingDays < discount.minBookingDays) {
      return false;
    }

    // Check property type applicability
    if (discount.applicablePropertyTypes && request.propertyType) {
      if (!discount.applicablePropertyTypes.includes(request.propertyType)) {
        return false;
      }
    }

    // Check listing type applicability
    if (discount.applicableListingTypes && request.listingType) {
      if (!discount.applicableListingTypes.includes(request.listingType)) {
        return false;
      }
    }

    return true;
  }

  // Generate discount code
  generateDiscountCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Utility methods
  getDiscountStatus(discount: Discount): string {
    const now = new Date();
    const validUntil = new Date(discount.validUntil);

    if (!discount.isActive) {
      return 'Disabled';
    }

    if (now > validUntil) {
      return 'Expired';
    }

    if (discount.maxUsageCount && discount.currentUsageCount >= discount.maxUsageCount) {
      return 'Usage Limit Reached';
    }

    return 'Active';
  }

  isDiscountExpired(discount: Discount): boolean {
    return new Date() > new Date(discount.validUntil);
  }

  isUsageLimitReached(discount: Discount): boolean {
    return discount.maxUsageCount ? discount.currentUsageCount >= discount.maxUsageCount : false;
  }

  private handleError(error: any): Observable<never> {
    this.logger.error('DiscountService error:', error);
    let errorMessage = 'An error occurred with discounts';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to manage discounts';
    } else if (error.status === 409) {
      errorMessage = 'Discount code already exists';
    }
    
    return throwError(() => errorMessage);
  }
}
