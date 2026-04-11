import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoggingService } from '../../../core/services/logging.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  const authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['forgotPassword']);
  const loggerMock = jasmine.createSpyObj<LoggingService>('LoggingService', ['error']);

  let component: ForgotPasswordComponent;

  beforeEach(() => {
    authServiceMock.forgotPassword.and.returnValue(of({ message: 'ok' }));
    component = new ForgotPasswordComponent(authServiceMock, loggerMock);
    authServiceMock.forgotPassword.calls.reset();
    loggerMock.error.calls.reset();
  });

  it('email yuborganda backend endpointga murojaat qilishi kerak', () => {
    component.email = ' test@misol.com ';

    component.sendResetSms();

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('test@misol.com');
    expect(component.submitted).toBeTrue();
    expect(component.loading).toBeFalse();
  });

  it("email bo'lmasa xatolik qaytarishi kerak", () => {
    component.email = '';

    component.sendResetSms();

    expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
    expect(component.errorMsg).toContain('Email kiriting');
    expect(component.loading).toBeFalse();
  });
});
