import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly accessTokenKey = 'accessToken';
  private readonly userKey = 'user';
  private readonly legacyUserKey = 'auth_user';

  /**
   * Emits the current authenticated user (loaded from localStorage on startup).
   * The token is persisted in localStorage so HTTP requests and SignalR can reuse it
   * after a page reload.
   */
  currentUser$ = new BehaviorSubject<AuthUser | null>(null);

  /**
   * In-memory access token for SignalR's accessTokenFactory.
   * Kept in sync with localStorage.
   */
  private accessToken$ = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private logger: LoggingService,
  ) {
    const savedUser = this.getStoredUser();
    if (savedUser) {
      this.currentUser$.next(savedUser);
    }

    const savedToken = localStorage.getItem(this.accessTokenKey);
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      this.accessToken$.next(savedToken);
    }
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
      this.accessToken$.next(res.accessToken);
    } else {
      localStorage.removeItem(this.accessTokenKey);
      this.accessToken$.next(null);
    }

    this.currentUser$.next(user);
  }

  clearAuth(): void {
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.legacyUserKey);
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refresh_token');
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

  private handleError = (error: HttpErrorResponse) => {
    if (this.logger) {
      this.logger.error('Auth API Error:', error);
    }
    return throwError(() => error);
  };

  /** Returns the in-memory access token. Use ONLY for SignalR's accessTokenFactory. */
  getToken(): string | null {
    const token = this.accessToken$.getValue() ?? localStorage.getItem(this.accessTokenKey);
    if (token && this.accessToken$.getValue() !== token) {
      this.accessToken$.next(token);
    }

    return token;
  }

  /**
   * Checks whether the in-memory access token exists and has not expired.
   * Cookie-based auth for HTTP requests does NOT require this check —
   * the browser sends cookies automatically and the server validates them.
   */
  isAuthenticated(): boolean {
    const user = this.currentUser$.getValue();
    if (!user) return false;

    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser$.getValue();
  }

  getUserRole(): UserRole | null {
    const user = this.currentUser$.getValue();
    return user ? user.role : null;
  }

  isHost(): boolean {
    const r = this.getUserRole();
    return r === UserRole.Host || r === UserRole.Admin;
  }

  isAdmin(): boolean {
    return this.getUserRole() === UserRole.Admin;
  }
}
