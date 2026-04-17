import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, PaginationParams, QueryParams } from '../models/pagination.model';
import { Property } from '../models/property.model';
import { UserResponse, UserRole } from '../models/user.model';
import { LoggingService } from './logging.service';

/**
 * Admin Dashboard Stats
 */
export interface AdminDashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  pendingVerifications: number;
  pendingBookings: number;
  activeUsers: number;
  newUsersToday: number;
}

/**
 * Property Verification Request
 */
export interface PropertyVerification {
  propertyId: string;
  propertyTitle: string;
  hostName: string;
  submittedAt: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * System Settings
 */
export interface SystemSettings {
  platformFee: number;
  maxImagesPerProperty: number;
  minBookingDays: number;
  maxBookingDays: number;
  autoConfirmThreshold: number;
  maintenanceMode: boolean;
}

/**
 * Signal-based Admin Agent Service
 * Manages admin operations using Angular Signals
 */
@Injectable({ providedIn: 'root' })
export class AdminAgent {
  private http = inject(HttpClient);
  private logger = inject(LoggingService);
  private apiUrl = `${environment.apiUrl}`;

  // ============ STATE SIGNALS ============
  private readonly _users = signal<UserResponse[]>([]);
  private readonly _properties = signal<Property[]>([]);
  private readonly _dashboardStats = signal<AdminDashboardStats | null>(null);
  private readonly _verifications = signal<PropertyVerification[]>([]);
  private readonly _systemSettings = signal<SystemSettings | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ============ PUBLIC READABLE SIGNALS ============
  readonly users = this._users.asReadonly();
  readonly properties = this._properties.asReadonly();
  readonly dashboardStats = this._dashboardStats.asReadonly();
  readonly verifications = this._verifications.asReadonly();
  readonly systemSettings = this._systemSettings.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // ============ COMPUTED VALUES ============
  readonly hosts = computed(() =>
    this._users().filter(u => Number(u.role) === UserRole.Host)
  );

  readonly guests = computed(() =>
    this._users().filter(u => Number(u.role) === UserRole.Guest)
  );

  readonly admins = computed(() =>
    this._users().filter(u => Number(u.role) === UserRole.Admin)
  );

  readonly pendingVerifications = computed(() =>
    this._verifications().filter(v => v.status === 'pending')
  );

  readonly unverifiedProperties = computed(() =>
    this._properties().filter(p => !p.isVerified)
  );

  readonly usersCount = computed(() => this._users().length);
  readonly propertiesCount = computed(() => this._properties().length);
  readonly pendingVerificationsCount = computed(() => this.pendingVerifications().length);

  // ============ OBSERVABLE INTEROP ============
  users$ = toObservable(this._users);
  properties$ = toObservable(this._properties);
  dashboardStats$ = toObservable(this._dashboardStats);
  verifications$ = toObservable(this._verifications);

  // ============ USER MANAGEMENT ============

  /**
   * Get all users (Admin only)
   */
  getAllUsers(params?: PaginationParams): Observable<PagedResult<UserResponse>> {
    this._loading.set(true);
    const query = this.buildQueryString(params);
    return this.http.get<PagedResult<UserResponse>>(`${this.apiUrl}/users${query}`).pipe(
      tap(result => {
        this._users.set(result.items);
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
   * Search users
   */
  searchUsers(query: string, params?: PaginationParams): Observable<PagedResult<UserResponse>> {
    this._loading.set(true);
    const queryString = this.buildQueryString({ ...params, search: query });
    return this.http.get<PagedResult<UserResponse>>(`${this.apiUrl}/users/search${queryString}`).pipe(
      tap(result => {
        this._users.set(result.items);
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
   * Get user by ID
   */
  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Create new user (Admin only)
   */
  createUser(data: Partial<UserResponse>): Observable<UserResponse> {
    this._loading.set(true);
    return this.http.post<UserResponse>(`${this.apiUrl}/users`, data).pipe(
      tap(user => {
        this._users.update(users => [user, ...users]);
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
   * Update user (Admin only)
   */
  updateUser(id: string, data: Partial<UserResponse>): Observable<UserResponse> {
    this._loading.set(true);
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}`, data).pipe(
      tap(user => {
        this._users.update(users =>
          users.map(u => u.id === id ? { ...u, ...user } : u)
        );
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
   * Delete user (Admin only)
   */
  deleteUser(id: string): Observable<void> {
    this._loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      tap(() => {
        this._users.update(users => users.filter(u => u.id !== id));
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
   * Change user role
   */
  changeUserRole(id: string, role: UserRole): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}/role`, { role }).pipe(
      tap(user => {
        this._users.update(users =>
          users.map(u => u.id === id ? user : u)
        );
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Suspend/Activate user
   */
  setUserStatus(id: string, isActive: boolean): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}/status`, { isActive }).pipe(
      tap(user => {
        this._users.update(users =>
          users.map(u => u.id === id ? { ...u, ...user } : u)
        );
      }),
      catchError(err => throwError(() => err))
    );
  }

  // ============ PROPERTY MANAGEMENT ============

  /**
   * Get all properties (Admin only)
   */
  getAllProperties(params?: QueryParams): Observable<PagedResult<Property>> {
    this._loading.set(true);
    const query = this.buildQueryString(params);
    return this.http.get<PagedResult<Property>>(`${this.apiUrl}/properties${query}`).pipe(
      tap(result => {
        this._properties.set(result.items);
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
   * Verify property
   */
  verifyProperty(propertyId: string): Observable<Property> {
    this._loading.set(true);
    return this.http.put<Property>(`${this.apiUrl}/properties/${propertyId}/verify`, {}).pipe(
      tap(property => {
        this._properties.update(properties =>
          properties.map(p => p.id === propertyId ? property : p)
        );
        this._verifications.update(verifications =>
          verifications.map(v =>
            v.propertyId === propertyId ? { ...v, status: 'approved' as const } : v
          )
        );
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
   * Reject property verification
   */
  rejectPropertyVerification(propertyId: string, reason: string): Observable<Property> {
    this._loading.set(true);
    return this.http.put<Property>(`${this.apiUrl}/properties/${propertyId}/reject`, { reason }).pipe(
      tap(property => {
        this._properties.update(properties =>
          properties.map(p => p.id === propertyId ? property : p)
        );
        this._verifications.update(verifications =>
          verifications.map(v =>
            v.propertyId === propertyId ? { ...v, status: 'rejected' as const } : v
          )
        );
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
   * Delete property (Admin only)
   */
  deleteProperty(id: string): Observable<void> {
    this._loading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/properties/${id}`).pipe(
      tap(() => {
        this._properties.update(properties => properties.filter(p => p.id !== id));
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
   * Get pending verifications
   */
  getPendingVerifications(): Observable<PropertyVerification[]> {
    this._loading.set(true);
    return this.http.get<PropertyVerification[]>(`${this.apiUrl}/properties/verifications/pending`).pipe(
      tap(verifications => {
        this._verifications.set(verifications);
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ============ ADMIN DASHBOARD ============

  /**
   * Get admin dashboard statistics
   */
  getDashboardStats(): Observable<AdminDashboardStats> {
    this._loading.set(true);
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/admin/dashboard`).pipe(
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
   * Get user statistics
   */
  getUserStatistics(): Observable<{ total: number; byRole: Record<string, number> }> {
    return this.http.get<{ total: number; byRole: Record<string, number> }>(
      `${this.apiUrl}/users/statistics`
    );
  }

  // ============ SYSTEM SETTINGS ============

  /**
   * Get system settings
   */
  getSystemSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(`${this.apiUrl}/admin/settings`).pipe(
      tap(settings => {
        this._systemSettings.set(settings);
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Update system settings
   */
  updateSystemSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(`${this.apiUrl}/admin/settings`, settings).pipe(
      tap(updated => {
        this._systemSettings.set(updated);
      }),
      catchError(err => throwError(() => err))
    );
  }

  // ============ STATE MANAGEMENT ============

  clearError(): void {
    this._error.set(null);
  }

  refreshData(): void {
    this.getAllUsers();
    this.getAllProperties();
    this.getDashboardStats();
    this.getPendingVerifications();
  }

  // ============ PRIVATE HELPERS ============

  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return query ? `?${query}` : '';
  }
}
