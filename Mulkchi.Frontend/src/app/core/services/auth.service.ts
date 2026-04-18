import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly usersUrl = `${environment.apiUrl}/users`;
  
  // Signals for state management
  private readonly _currentUser = signal<User | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _isAuthenticated = computed(() => !!this._accessToken() && !!this._currentUser());
  
  // Public readonly signals
  readonly currentUser = computed(() => this._currentUser());
  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }
  
  private loadStoredAuth(): void {
    const token = localStorage.getItem('access_token');
    const userJson = localStorage.getItem('user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this._accessToken.set(token);
        this._currentUser.set(user);
      } catch {
        this.clearAuth();
      }
    }
  }
  
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => throwError(() => error))
    );
  }
  
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => throwError(() => error))
    );
  }
  
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }
  
  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.clearAuth(),
      error: () => this.clearAuth() // Clear locally even if server fails
    });
  }
  
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this._currentUser.set(user)),
      catchError(error => throwError(() => error))
    );
  }
  
  updateProfile(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/me`, user).pipe(
      tap(updatedUser => {
        this._currentUser.set(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }),
      catchError(error => throwError(() => error))
    );
  }
  
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      catchError(error => throwError(() => error))
    );
  }
  
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, { token, newPassword }).pipe(
      catchError(error => throwError(() => error))
    );
  }
  
  private handleAuthResponse(response: AuthResponse): void {
    this._accessToken.set(response.token);
    this._currentUser.set({
      id: response.userId,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      avatarUrl: response.avatarUrl,
      role: response.role,
      gender: 'Other' as any, // Will be populated by getCurrentUser()
      isVerified: false,
      emailConfirmed: false,
      badge: 'New' as any,
      rating: 0,
      responseRate: 0,
      responseTimeMinutes: 0,
      totalListings: 0,
      totalBookings: 0,
      preferredLanguage: 'uz',
      createdDate: new Date(),
      updatedDate: new Date()
    });
    
    localStorage.setItem('access_token', response.token);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(this._currentUser()));
    
    // Fetch full user details
    this.getCurrentUser().subscribe();
  }
  
  private clearAuth(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
  
  getAccessToken(): string | null {
    return this._accessToken();
  }
  
  isHost(): boolean {
    const role = this._currentUser()?.role;
    return role === UserRole.Host || role === UserRole.Admin || role === UserRole.SuperAdmin;
  }
  
  isAdmin(): boolean {
    const role = this._currentUser()?.role;
    return role === UserRole.Admin || role === UserRole.SuperAdmin;
  }
}
