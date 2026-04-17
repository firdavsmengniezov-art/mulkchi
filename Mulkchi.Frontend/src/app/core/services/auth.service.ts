import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  AuthUserInfo,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UserRole,
} from '../models/auth.model';
import { LoggingService } from './logging.service';

/**
 * Signal-based Auth Service
 * Provides reactive authentication state using Angular Signals
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private logger = inject(LoggingService);
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly accessTokenKey = 'accessToken';
  private readonly userKey = 'user';
  private readonly legacyUserKey = 'auth_user';

  // ============ SIGNAL STATE ============
  private readonly _currentUser = signal<AuthUser | null>(this.getStoredUser());
  private readonly _accessToken = signal<string | null>(this.getStoredToken());

  // ============ PUBLIC READABLE SIGNALS ============
  readonly currentUser = this._currentUser.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();

  // ============ COMPUTED VALUES ============
  readonly isAuthenticated = computed(() => {
    const user = this._currentUser();
    const token = this._accessToken();
    if (!user || !token) return false;
    return !this.isTokenExpired(token);
  });
  readonly isLoggedIn = this.isAuthenticated;
  readonly isHost = computed(() => {
    const role = this._currentUser()?.role as unknown;
    return role === UserRole.Host || role === UserRole.Admin || role === 'Host' || role === 'Admin';
  });
  readonly isAdmin = computed(() => {
    const role = this._currentUser()?.role as unknown;
    return role === UserRole.Admin || role === 'Admin';
  });
  readonly isAgent = computed(() => {
    const role = this._currentUser()?.role as unknown;
    return role === UserRole.Agent || role === 'Agent';
  });
  readonly isSeller = computed(() => {
    const role = this._currentUser()?.role as unknown;
    return role === UserRole.Seller || role === 'Seller';
  });
  readonly isBuyer = computed(() => {
    const role = this._currentUser()?.role as unknown;
    return role === UserRole.Buyer || role === 'Buyer';
  });
  readonly userFullName = computed(() => {
    const user = this._currentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  });

  // ============ OBSERVABLE INTEROP (backward compatibility) ============
  currentUser$ = new BehaviorSubject<AuthUser | null>(this._currentUser());
  private accessToken$ = new BehaviorSubject<string | null>(this._accessToken());

  // Observable from signals for new code
  currentUserSignal$ = toObservable(this._currentUser);

  constructor() {
    // Sync signal changes to BehaviorSubjects for backward compatibility
    // This allows old code using .subscribe() to still work
  }

  login(req: LoginRequest): Observable<AuthUserInfo> {
    return this.http
      .post<AuthUserInfo>(`${this.apiUrl}/login`, req, { withCredentials: true })
      .pipe(
        tap((res) => this.saveAuth(res)),
        catchError(this.handleError),
      );
  }

  register(req: RegisterRequest): Observable<AuthUserInfo> {
    return this.http
      .post<AuthUserInfo>(`${this.apiUrl}/register`, req, { withCredentials: true })
      .pipe(
        tap((res) => this.saveAuth(res)),
        catchError(this.handleError),
      );
  }

  /**
   * Silently refreshes the session using the httpOnly refresh-token cookie.
   * Falls back to a refresh token from storage if one exists.
   */
  refreshToken(): Observable<AuthUserInfo> {
    const refreshToken =
      localStorage.getItem('refreshToken') ?? localStorage.getItem('refresh_token');
    const body = refreshToken ? { refreshToken } : {};

    return this.http
      .post<AuthUserInfo>(`${this.apiUrl}/refresh-token`, body, { withCredentials: true })
      .pipe(
        tap((res) => this.saveAuth(res)),
        catchError(this.handleError),
      );
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    const request: ForgotPasswordRequest = { email };

    return this.http
      .post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, request, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  resetPassword(token: string, newPassword: string): Observable<ResetPasswordResponse> {
    const request: ResetPasswordRequest = { token, newPassword };

    return this.http
      .post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, request, {
        withCredentials: true,
      })
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<void> {
    const refreshToken =
      localStorage.getItem('refreshToken') ?? localStorage.getItem('refresh_token');
    const body = refreshToken ? { refreshToken } : {};

    return this.http.post<void>(`${this.apiUrl}/logout`, body, { withCredentials: true }).pipe(
      tap(() => this.clearAuth()),
      catchError((err) => {
        // Clear local state even if the server call fails
        this.clearAuth();
        return throwError(() => err);
      }),
    );
  }

  private saveAuth(res: AuthUserInfo): void {
    const user: AuthUser = {
      id: String(res.userId),
      email: res.email,
      role: res.role,
      firstName: res.firstName ?? '',
      lastName: res.lastName ?? '',
      avatarUrl: res.avatarUrl ?? undefined,
    };

    localStorage.setItem(this.userKey, JSON.stringify(user));
    localStorage.setItem(this.legacyUserKey, JSON.stringify(user));

    if (res.accessToken) {
      localStorage.setItem(this.accessTokenKey, res.accessToken);
      this._accessToken.set(res.accessToken);
      this.accessToken$.next(res.accessToken);
    } else {
      localStorage.removeItem(this.accessTokenKey);
      this._accessToken.set(null);
      this.accessToken$.next(null);
    }

    this._currentUser.set(user);
    this.currentUser$.next(user);
  }

  clearAuth(): void {
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.legacyUserKey);
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refresh_token');
    this._currentUser.set(null);
    this._accessToken.set(null);
    this.currentUser$.next(null);
    this.accessToken$.next(null);
  }

  private getStoredUser(): AuthUser | null {
    const rawUser = localStorage.getItem(this.userKey) ?? localStorage.getItem(this.legacyUserKey);

    if (!rawUser || rawUser === 'undefined' || rawUser === 'null') {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.legacyUserKey);
      return null;
    }
  }

  private getStoredToken(): string | null {
    const token = localStorage.getItem(this.accessTokenKey);
    if (token && token !== 'undefined' && token !== 'null') {
      return token;
    }
    return null;
  }

  private handleError = (error: HttpErrorResponse) => {
    if (this.logger) {
      this.logger.error('Auth API Error:', error);
    }
    return throwError(() => error);
  };

  /** Returns the in-memory access token. Use ONLY for SignalR's accessTokenFactory. */
  getToken(): string | null {
    const token = this._accessToken() ?? localStorage.getItem(this.accessTokenKey);
    if (token && this._accessToken() !== token) {
      this._accessToken.set(token);
      this.accessToken$.next(token);
    }

    return token;
  }

  /**
   * Checks whether the in-memory access token exists and has not expired.
   * Cookie-based auth for HTTP requests does NOT require this check —
   * the browser sends cookies automatically and the server validates them.
   */
  isAuthenticatedCheck(): boolean {
    return this.isAuthenticated();
  }

  getCurrentUser(): AuthUser | null {
    return this._currentUser();
  }

  getUserRole(): UserRole | null {
    return this._currentUser()?.role ?? null;
  }

  isHostRole(): boolean {
    return this.isHost();
  }

  isAdminRole(): boolean {
    return this.isAdmin();
  }

  isAgentRole(): boolean {
    return this.isAgent();
  }

  isSellerRole(): boolean {
    return this.isSeller();
  }

  isBuyerRole(): boolean {
    return this.isBuyer();
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
