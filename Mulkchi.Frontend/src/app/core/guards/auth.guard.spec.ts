import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('autentifikatsiya bo\'lgan foydalanuvchiga ruxsat berishi kerak', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any));

    expect(result).toBeTrue();
  });

  it('autentifikatsiya bo\'lmaganlarni login ga yo\'naltirishi kerak', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any));

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBeFalse();
  });
});
