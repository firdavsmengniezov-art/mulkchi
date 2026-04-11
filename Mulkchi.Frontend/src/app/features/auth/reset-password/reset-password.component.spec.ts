import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoggingService } from '../../../core/services/logging.service';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  const routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
  const authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['resetPassword']);
  const loggerMock = jasmine.createSpyObj<LoggingService>('LoggingService', ['error']);
  let component: ResetPasswordComponent;

  beforeEach(() => {
    authServiceMock.resetPassword.and.returnValue(of({ message: 'ok' }));
    routerMock.navigate.calls.reset();
    authServiceMock.resetPassword.calls.reset();
    loggerMock.error.calls.reset();

    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ token: 'reset-token-123' }) },
          },
        },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LoggingService, useValue: loggerMock },
      ],
    });

    component = TestBed.createComponent(ResetPasswordComponent).componentInstance;

    component.ngOnInit();
  });

  it('token bilan backendga yangi parol yuborishi kerak', () => {
    component.newPassword = 'Test1234';
    component.confirmPassword = 'Test1234';

    component.resetPassword();

    expect(authServiceMock.resetPassword).toHaveBeenCalledWith('reset-token-123', 'Test1234');
    expect(component.submitted).toBeTrue();
    expect(component.loading).toBeFalse();
  });

  it("token bo'lmasa xatolik ko'rsatishi kerak", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: LoggingService, useValue: loggerMock },
      ],
    });

    const componentWithoutToken = TestBed.createComponent(ResetPasswordComponent).componentInstance;
    componentWithoutToken.ngOnInit();

    expect(componentWithoutToken.errorMsg).toContain('Reset havolasi topilmadi');
  });

  it('parollar mos kelmasa yubormasligi kerak', () => {
    component.newPassword = 'Test1234';
    component.confirmPassword = 'Different1234';

    component.resetPassword();

    expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
    expect(component.errorMsg).toContain('Parollar mos kelmadi');
  });
});
