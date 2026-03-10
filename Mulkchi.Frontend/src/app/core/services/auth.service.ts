import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse, AuthUser, UserRole } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('auth_user');
    if (saved) this.currentUser$.next(JSON.parse(saved));
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, req).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const token = localStorage.getItem('refresh_token');
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken: token }).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  private saveAuth(res: AuthResponse): void {
    localStorage.setItem('access_token', res.token);
    localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    this.currentUser$.next(res.user);
  }

  logout(): void {
    localStorage.clear();
    this.currentUser$.next(null);
  }

  getToken(): string | null { return localStorage.getItem('access_token'); }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    try {
      // Check token not expired
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
