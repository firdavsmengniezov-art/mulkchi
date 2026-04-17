import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

/**
 * Dashboard Statistics Interface
 */
export interface DashboardStats {
  totalProperties: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  activeListings: number;
  newUsersThisMonth: number;
  newBookingsThisMonth: number;
}

/**
 * Property Statistics Interface
 */
export interface PropertyStats {
  propertyId: string;
  viewsCount: number;
  bookingsCount: number;
  revenue: number;
  averageRating: number;
  favoritesCount: number;
  conversionRate: number;
}

/**
 * User Statistics Interface
 */
export interface UserStats {
  totalUsers: number;
  hostsCount: number;
  guestsCount: number;
  adminsCount: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

/**
 * Booking Statistics Interface
 */
export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  bookingsByMonth: { month: string; count: number; revenue: number }[];
}

/**
 * Revenue Statistics Interface
 */
export interface RevenueStats {
  totalRevenue: number;
  platformFees: number;
  hostPayouts: number;
  refunds: number;
  netRevenue: number;
  revenueByMonth: { month: string; revenue: number; fees: number }[];
  revenueByProperty: { propertyId: string; title: string; revenue: number }[];
}

/**
 * Chart Data Interface for ngx-charts
 */
export interface ChartData {
  name: string;
  value: number;
  series?: { name: string; value: number }[];
}

/**
 * Signal-based Analytics Agent Service
 * Manages analytics data using Angular Signals
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsAgent {
  private http = inject(HttpClient);
  private logger = inject(LoggingService);
  private apiUrl = `${environment.apiUrl}/analytics`;

  // ============ STATE SIGNALS ============
  private readonly _dashboardStats = signal<DashboardStats | null>(null);
  private readonly _propertyStats = signal<PropertyStats[]>([]);
  private readonly _userStats = signal<UserStats | null>(null);
  private readonly _bookingStats = signal<BookingStats | null>(null);
  private readonly _revenueStats = signal<RevenueStats | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ============ PUBLIC READABLE SIGNALS ============
  readonly dashboardStats = this._dashboardStats.asReadonly();
  readonly propertyStats = this._propertyStats.asReadonly();
  readonly userStats = this._userStats.asReadonly();
  readonly bookingStats = this._bookingStats.asReadonly();
  readonly revenueStats = this._revenueStats.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // ============ COMPUTED CHART DATA ============

  /**
   * Dashboard overview chart data
   */
  readonly dashboardChartData = computed((): ChartData[] => {
    const stats = this._dashboardStats();
    if (!stats) return [];

    return [
      { name: 'Mulklar', value: stats.totalProperties },
      { name: 'Foydalanuvchilar', value: stats.totalUsers },
      { name: 'Bronlar', value: stats.totalBookings },
      { name: 'Faol e\'lonlar', value: stats.activeListings }
    ];
  });

  /**
   * Revenue chart data for line chart
   */
  readonly revenueChartData = computed((): ChartData[] => {
    const stats = this._revenueStats();
    if (!stats?.revenueByMonth) return [];

    return stats.revenueByMonth.map(item => ({
      name: item.month,
      value: item.revenue,
      series: [
        { name: 'Daromad', value: item.revenue },
        { name: 'Komissiya', value: item.fees }
      ]
    }));
  });

  /**
   * Bookings by month for bar chart
   */
  readonly bookingsChartData = computed((): ChartData[] => {
    const stats = this._bookingStats();
    if (!stats?.bookingsByMonth) return [];

    return stats.bookingsByMonth.map(item => ({
      name: item.month,
      value: item.count,
      series: [
        { name: 'Bronlar', value: item.count },
        { name: 'Daromad', value: item.revenue }
      ]
    }));
  });

  /**
   * User distribution pie chart data
   */
  readonly userDistributionChartData = computed((): ChartData[] => {
    const stats = this._userStats();
    if (!stats) return [];

    return [
      { name: 'Mehmonlar', value: stats.guestsCount },
      { name: 'Hostlar', value: stats.hostsCount },
      { name: 'Adminlar', value: stats.adminsCount }
    ];
  });

  /**
   * Top performing properties
   */
  readonly topProperties = computed((): ChartData[] => {
    const stats = this._revenueStats();
    if (!stats?.revenueByProperty) return [];

    return stats.revenueByProperty
      .slice(0, 10)
      .map(item => ({
        name: item.title,
        value: item.revenue
      }));
  });

  // ============ OBSERVABLE INTEROP ============
  dashboardStats$ = toObservable(this._dashboardStats);
  propertyStats$ = toObservable(this._propertyStats);
  userStats$ = toObservable(this._userStats);
  bookingStats$ = toObservable(this._bookingStats);
  revenueStats$ = toObservable(this._revenueStats);

  // ============ ANALYTICS OPERATIONS ============

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    this._loading.set(true);
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`).pipe(
      tap(stats => {
        this._dashboardStats.set(stats);
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
   * Get property statistics
   */
  getPropertyStats(propertyId?: string): Observable<PropertyStats | PropertyStats[]> {
    this._loading.set(true);
    const url = propertyId
      ? `${this.apiUrl}/properties/${propertyId}`
      : `${this.apiUrl}/properties`;

    return this.http.get<PropertyStats | PropertyStats[]>(url).pipe(
      tap(stats => {
        if (Array.isArray(stats)) {
          this._propertyStats.set(stats);
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

  /**
   * Get user statistics
   */
  getUserStats(): Observable<UserStats> {
    this._loading.set(true);
    return this.http.get<UserStats>(`${this.apiUrl}/users`).pipe(
      tap(stats => {
        this._userStats.set(stats);
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
   * Get booking statistics
   */
  getBookingStats(): Observable<BookingStats> {
    this._loading.set(true);
    return this.http.get<BookingStats>(`${this.apiUrl}/bookings`).pipe(
      tap(stats => {
        this._bookingStats.set(stats);
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
   * Get revenue statistics
   */
  getRevenueStats(): Observable<RevenueStats> {
    this._loading.set(true);
    return this.http.get<RevenueStats>(`${this.apiUrl}/revenue`).pipe(
      tap(stats => {
        this._revenueStats.set(stats);
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
   * Load all analytics data at once
   */
  loadAllStats(): Observable<void> {
    this._loading.set(true);
    return new Observable(observer => {
      let completed = 0;
      const total = 5;

      const checkComplete = () => {
        completed++;
        if (completed === total) {
          this._loading.set(false);
          observer.next();
          observer.complete();
        }
      };

      this.getDashboardStats().subscribe({ next: checkComplete, error: checkComplete });
      this.getPropertyStats().subscribe({ next: checkComplete, error: checkComplete });
      this.getUserStats().subscribe({ next: checkComplete, error: checkComplete });
      this.getBookingStats().subscribe({ next: checkComplete, error: checkComplete });
      this.getRevenueStats().subscribe({ next: checkComplete, error: checkComplete });
    });
  }

  // ============ STATE MANAGEMENT ============

  clearError(): void {
    this._error.set(null);
  }

  refreshStats(): void {
    this.loadAllStats().subscribe();
  }
}
