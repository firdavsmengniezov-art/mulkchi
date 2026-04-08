import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthUserInfo, AuthUser, UserRole } from '../models/auth.model';
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Emits the current authenticated user (loaded from localStorage on startup).
   * Tokens are never stored here or in localStorage — they live in httpOnly cookies
   * (primary auth) and in `accessToken$` (in-memory, for SignalR only).
   */
  currentUser$ = new BehaviorSubject<AuthUser | null>(null);

  /**
   * In-memory access token for SignalR's accessTokenFactory.
   * Lost on page refresh; recovered via a silent refresh call in AppComponent.
   * Must NOT be written to localStorage or sessionStorage.
   */
  private accessToken$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient,
    private logger: LoggingService) {
    const saved = localStorage.getItem('auth_user');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        this.currentUser$.next(JSON.parse(saved));
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
  }

  login(req: LoginRequest): Observable<AuthUserInfo> {
    return this.http
      .post<AuthUserInfo>(`${this.apiUrl}/login`, req, { withCredentials: true })
      .pipe(tap(res => this.saveAuth(res)), catchError(this.handleError));
  }

  register(req: RegisterRequest): Observable<AuthUserInfo> {
    return this.http
      .post<AuthUserInfo>(`${this.apiUrl}/register`, req, { withCredentials: true })
      .pipe(tap(res => this.saveAuth(res)), catchError(this.handleError));
  }

  /**
   * Silently refreshes the session using the httpOnly refresh-token cookie.
   * No request body is needed — the cookie is sent automatically.
   * Call this on application startup to restore an in-memory access token
   * for SignalR after a page reload.
   */
  refreshToken(): Observable<AuthUserInfo> {
    return this.http
      .post<AuthUserInfo>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(tap(res => this.saveAuth(res)), catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/forgot-password`, { email }, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.clearAuth()),
        catchError(err => {
          // Clear local state even if the server call fails
          this.clearAuth();
          return throwError(() => err);
        })
      );
  }

  private saveAuth(res: AuthUserInfo): void {
    // Store user display info in localStorage for UI persistence across reloads
    const user: AuthUser = {
      id: res.userId,
      email: res.email,
      role: res.role,
      firstName: res.firstName ?? '',
      lastName: res.lastName ?? '',
      avatarUrl: res.avatarUrl ?? undefined
    };
    localStorage.setItem('auth_user', JSON.stringify(user));
    this.currentUser$.next(user);

    // Keep the access token in memory ONLY — for SignalR's accessTokenFactory
    this.accessToken$.next(res.accessToken ?? null);
  }

  clearAuth(): void {
    localStorage.removeItem('auth_user');
    this.currentUser$.next(null);
    this.accessToken$.next(null);
  }

  private handleError(error: HttpErrorResponse) {
    this.logger.error('Auth API Error:', error);
    return throwError(() => error);
  }

  /** Returns the in-memory access token. Use ONLY for SignalR's accessTokenFactory. */
  getToken(): string | null {
    return this.accessToken$.getValue();
  }

  /**
   * Checks whether the in-memory access token exists and has not expired.
   * Cookie-based auth for HTTP requests does NOT require this check —
   * the browser sends cookies automatically and the server validates them.
   */
  isAuthenticated(): boolean {
    const user = this.currentUser$.getValue();
    if (!user) return false;

    const token = this.accessToken$.getValue();
    if (!token) {
      // User info is present (from localStorage) but in-memory token is gone
      // (e.g. after a page reload). Consider authenticated for UI purposes;
      // the next API call will validate the session cookie.
      return true;
    }

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

