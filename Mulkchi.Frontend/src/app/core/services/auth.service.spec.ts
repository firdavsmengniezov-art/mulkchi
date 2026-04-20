import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { LoginRequest, UserRole } from '../models';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login user and store token', (done) => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        userId: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'Guest'
      };

      service.login(loginRequest).subscribe({
        next: (response) => {
          expect(response.token).toBe('mock-jwt-token');
          expect(localStorage.getItem('access_token')).toBe('mock-jwt-token');
          expect(service.isAuthenticated()).toBe(true);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle login error', (done) => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      service.login(loginRequest).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('isHost', () => {
    it('should return true for Host role', () => {
      // Mock user data in localStorage
      const mockUser = {
        id: '123',
        email: 'host@example.com',
        firstName: 'Host',
        lastName: 'User',
        role: UserRole.Host,
        gender: 'Other',
        isVerified: true,
        emailConfirmed: true,
        badge: 'Super',
        rating: 5,
        responseRate: 100,
        responseTimeMinutes: 30,
        totalListings: 10,
        totalBookings: 5,
        preferredLanguage: 'uz',
        createdDate: new Date(),
        updatedDate: new Date()
      };

      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Reload service to pick up stored auth
      service = TestBed.inject(AuthService);

      expect(service.isHost()).toBe(true);
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear auth data on logout', () => {
      // Setup authenticated state
      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('refresh_token', 'mock-refresh');
      localStorage.setItem('user', JSON.stringify({ id: '123' }));

      service.logout();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.flush({});

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
