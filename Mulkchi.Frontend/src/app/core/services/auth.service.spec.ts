import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

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
        { provide: Router, useValue: routerSpy }
      ]
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

  it('login — muvaffaqiyatli bo\'lganda token saqlashi kerak', () => {
    const mockResponse = {
      token: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: { id: '1', email: 'test@test.com', role: 'User' }
    };

    service.login({ email: 'test@test.com', password: 'Test123!' })
      .subscribe(res => {
        expect(res.token).toBe('test-access-token');
        expect(localStorage.getItem('access_token'))
          .toBe('test-access-token');
      });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('logout — API ga chaqirishi va localStorage tozalashi kerak', () => {
    localStorage.setItem('refresh_token', 'old-token');

    service.logout().subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.refreshToken).toBe('old-token');
    req.flush({ success: true });

    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('isAuthenticated — token bo\'lsa true qaytarishi kerak', () => {
    const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
    const payload = btoa(JSON.stringify({sub: '1234567890', exp: Math.floor(Date.now() / 1000) + 3600}));
    const token = `${header}.${payload}.signature`;
    localStorage.setItem('access_token', token);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('isAuthenticated — token bo\'lmasa false qaytarishi kerak', () => {
    localStorage.clear();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
