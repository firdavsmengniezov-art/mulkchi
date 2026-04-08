import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import {
  AnalyticsFilters,
  AnalyticsPeriod,
  BookingAnalytics,
  DashboardAnalytics,
  OverviewMetrics,
  PropertyAnalytics,
  RecommendationAnalytics,
  RevenueAnalytics,
  UserAnalytics,
  ViewAnalytics,
} from '../models/dashboard-analytics.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardAnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  // Get complete dashboard analytics
  getDashboardAnalytics(filters?: AnalyticsFilters): Observable<DashboardAnalytics> {
    const params = this.buildQueryParams(filters);
    const url = params ? `${this.apiUrl}/dashboard?${params}` : `${this.apiUrl}/dashboard`;

    return this.http.get<DashboardAnalytics>(url).pipe(catchError(this.handleError));
  }

  // Overview metrics
  getOverviewMetrics(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<OverviewMetrics> {
    return this.http
      .get<OverviewMetrics>(`${this.apiUrl}/overview?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  // Revenue analytics
  getRevenueAnalytics(
    period: AnalyticsPeriod = AnalyticsPeriod.Month,
  ): Observable<RevenueAnalytics> {
    return this.http
      .get<RevenueAnalytics>(`${this.apiUrl}/revenue?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getMonthlyRevenue(year: number): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/revenue/monthly/${year}`)
      .pipe(catchError(this.handleError));
  }

  getRevenueByRegion(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/revenue/by-region?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  // User analytics
  getUserAnalytics(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<UserAnalytics> {
    return this.http
      .get<UserAnalytics>(`${this.apiUrl}/users?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getUserGrowth(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/users/growth?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getUserDemographics(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/users/demographics`)
      .pipe(catchError(this.handleError));
  }

  // Property analytics
  getPropertyAnalytics(
    period: AnalyticsPeriod = AnalyticsPeriod.Month,
  ): Observable<PropertyAnalytics> {
    return this.http
      .get<PropertyAnalytics>(`${this.apiUrl}/properties?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getTopViewedProperties(limit = 10): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/properties/top-viewed?limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  getTopBookedProperties(limit = 10): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/properties/top-booked?limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  getPropertyPerformance(propertyId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/properties/${propertyId}/performance`)
      .pipe(catchError(this.handleError));
  }

  // Booking analytics
  getBookingAnalytics(
    period: AnalyticsPeriod = AnalyticsPeriod.Month,
  ): Observable<BookingAnalytics> {
    return this.http
      .get<BookingAnalytics>(`${this.apiUrl}/bookings?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getBookingTrends(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/bookings/trends?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getBookingConversion(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/bookings/conversion?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  // View analytics
  getViewAnalytics(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<ViewAnalytics> {
    return this.http
      .get<ViewAnalytics>(`${this.apiUrl}/views?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getViewTrends(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/views/trends?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getViewsByRegion(period: AnalyticsPeriod = AnalyticsPeriod.Month): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/views/by-region?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  // Recommendation analytics
  getRecommendationAnalytics(
    period: AnalyticsPeriod = AnalyticsPeriod.Month,
  ): Observable<RecommendationAnalytics> {
    return this.http
      .get<RecommendationAnalytics>(`${this.apiUrl}/recommendations?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  // Host-specific analytics
  getHostAnalytics(
    hostId: string,
    period: AnalyticsPeriod = AnalyticsPeriod.Month,
  ): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/hosts/${hostId}?period=${period}`)
      .pipe(catchError(this.handleError));
  }

  getHostPropertyPerformance(hostId: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/hosts/${hostId}/properties`)
      .pipe(catchError(this.handleError));
  }

  // Real-time analytics
  getRealTimeMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/realtime`).pipe(catchError(this.handleError));
  }

  // Export analytics
  exportAnalytics(
    type: string,
    format: 'csv' | 'excel' | 'pdf',
    filters?: AnalyticsFilters,
  ): Observable<Blob> {
    const params = this.buildQueryParams(filters);
    const url = params
      ? `${this.apiUrl}/export/${type}?${params}&format=${format}`
      : `${this.apiUrl}/export/${type}?format=${format}`;

    return this.http.get(url, { responseType: 'blob' }).pipe(catchError(this.handleError));
  }

  // Utility methods
  private buildQueryParams(filters?: AnalyticsFilters): string {
    if (!filters) return '';

    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.region) params.append('region', filters.region);
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.userType) params.append('userType', filters.userType);

    return params.toString();
  }

  // Formatting helpers
  formatCurrency(amount: number, currency: string = 'UZS'): string {
    return `${currency} ${amount.toLocaleString('uz-UZ')}`;
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  formatGrowth(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
  }

  getGrowthColor(value: number): string {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  getGrowthIcon(value: number): string {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  }

  // Chart data preparation
  prepareRevenueChart(data: any[]): any {
    return {
      labels: data.map((item) => item.month || item.date),
      datasets: [
        {
          label: 'Daromad (UZS)',
          data: data.map((item) => item.revenue),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
        },
      ],
    };
  }

  prepareUserGrowthChart(data: any[]): any {
    return {
      labels: data.map((item) => item.date),
      datasets: [
        {
          label: 'Yangi foydalanuvchilar',
          data: data.map((item) => item.newUsers),
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          borderWidth: 1,
        },
        {
          label: 'Faol foydalanuvchilar',
          data: data.map((item) => item.activeUsers),
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          borderWidth: 1,
        },
      ],
    };
  }

  prepareBookingChart(data: any[]): any {
    return {
      labels: data.map((item) => item.date),
      datasets: [
        {
          label: 'Bronlar soni',
          data: data.map((item) => item.bookingsCount),
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  }

  prepareRegionChart(data: any[]): any {
    return {
      labels: data.map((item) => item.region),
      datasets: [
        {
          label: 'Bronlar',
          data: data.map((item) => item.bookingsCount),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
          borderWidth: 1,
        },
      ],
    };
  }

  private handleError(error: any): Observable<never> {
    this.logger.error('DashboardAnalyticsService error:', error);
    let errorMessage = 'An error occurred with analytics data';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to view analytics';
    } else if (error.status === 404) {
      errorMessage = 'Analytics data not found';
    }

    return throwError(() => errorMessage);
  }
}
