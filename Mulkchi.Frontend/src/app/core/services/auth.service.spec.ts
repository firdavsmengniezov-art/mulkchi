import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('yaratilishi kerak', () => {
    expect(service).toBeTruthy();
  });

  it("login — muvaffaqiyatli bo'lganda token saqlashi kerak", () => {
    const mockResponse = {
      userId: '1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 0,
      expiresAt: new Date().toISOString(),
      accessToken: 'test-access-token',
    };

    service.login({ email: 'test@test.com', password: 'Test123!' }).subscribe((res) => {
      expect(res.accessToken).toBe('test-access-token');
      expect(localStorage.getItem('accessToken')).toBe('test-access-token');
      expect(localStorage.getItem('user')).toContain('test@test.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('logout — API ga chaqirishi va localStorage tozalashi kerak', () => {
    localStorage.setItem('accessToken', 'old-access-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 0 }));
    localStorage.setItem('refresh_token', 'old-token');

    service.logout().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.refreshToken).toBe('old-token');
    req.flush(null);

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it("isAuthenticated — token bo'lsa true qaytarishi kerak", () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({ sub: '1234567890', exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    const token = `${header}.${payload}.signature`;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 0 }));
    service.currentUser$.next({
      id: '1',
      email: 'test@test.com',
      role: 0,
      firstName: 'Test',
      lastName: 'User',
    });
    expect(service.isAuthenticated()).toBeTrue();
  });

  it("isAuthenticated — token bo'lmasa false qaytarishi kerak", () => {
    localStorage.clear();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
