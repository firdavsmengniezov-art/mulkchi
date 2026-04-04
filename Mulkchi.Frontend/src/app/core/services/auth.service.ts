import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, AuthUser, UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('auth_user');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        this.currentUser$.next(JSON.parse(saved));
      } catch (error) {
        console.warn('Invalid auth_user data in localStorage, clearing...');
        localStorage.removeItem('auth_user');
      }
    }
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => this.saveAuth(res)),
      catchError(this.handleError)
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, req).pipe(
      tap(res => this.saveAuth(res)),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const token = localStorage.getItem('refresh_token');
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken: token }).pipe(
      tap(res => this.saveAuth(res)),
      catchError(this.handleError)
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  private saveAuth(res: AuthResponse): void {
    localStorage.setItem('access_token', res.token);
    localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    this.currentUser$.next(res.user);
  }

  logout(): Observable<void> {
    const token = localStorage.getItem('refresh_token');
    return this.http.post<void>(`${this.apiUrl}/logout`, { refreshToken: token }).pipe(
      tap(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        this.currentUser$.next(null);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth API Error:', error);
    return throwError(() => error);
  }

  getToken(): string | null { return localStorage.getItem('access_token'); }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  getCurrentUser(): any {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        firstName: payload['firstName'] || payload['name'] || 'User'
      };
    } catch {
      return null;
    }
  }

  getUserRole(): UserRole | null {
    const user = this.currentUser$.getValue();
    return user ? user.role : null;
  }
  isHost(): boolean { const r = this.getUserRole(); return r === UserRole.Host || r === UserRole.Admin; }
  isAdmin(): boolean { return this.getUserRole() === UserRole.Admin; }
}
