import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RegisterRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoggingService } from '../../../core/services/logging.service';
import { UiToastService } from '../../../core/services/ui-toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggingService);
  private readonly toast = inject(UiToastService);
  private readonly translate = inject(TranslateService);

  register() {
    if (!this.firstName || !this.email || !this.password || !this.phone) {
      this.errorMsg = this.translate.instant('AUTH.MESSAGES.FILL_REQUIRED_FIELDS');
      this.toast.error(this.errorMsg);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.errorMsg = this.translate.instant('AUTH.MESSAGES.PASSWORD_RULES');
      this.toast.error(this.errorMsg);
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = this.translate.instant('AUTH.MESSAGES.PASSWORD_MISMATCH');
      this.toast.error(this.errorMsg);
      return;
    }

    if (!this.acceptTerms) {
      this.errorMsg = this.translate.instant('AUTH.MESSAGES.ACCEPT_TERMS');
      this.toast.error(this.errorMsg);
      return;
    }

    const registerRequest: RegisterRequest = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      preferredLanguage: 'uz',
    };

    this.loading = true;
    this.errorMsg = '';

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.toast.success(this.translate.instant('AUTH.MESSAGES.REGISTER_SUCCESS'));
        this.router.navigate(['/register-success'], {
          queryParams: { email: this.email },
        });
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 409) {
          this.errorMsg = this.translate.instant('AUTH.MESSAGES.REGISTER_CONFLICT');
        } else if (err.status === 400) {
          this.errorMsg = this.translate.instant('AUTH.MESSAGES.REGISTER_BAD_REQUEST');
        } else {
          this.errorMsg = this.translate.instant('AUTH.MESSAGES.REGISTER_FAILED');
        }
        this.toast.error(this.errorMsg);
        this.logger.error('Registration error:', err);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
