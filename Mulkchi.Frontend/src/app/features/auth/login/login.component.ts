import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoginRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoggingService } from '../../../core/services/logging.service';
import { UiToastService } from '../../../core/services/ui-toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  remember = false;
  showPassword = false;
  loading = false;
  errorMsg = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggingService);
  private readonly toast = inject(UiToastService);
  private readonly translate = inject(TranslateService);

  login() {
    if (!this.email || !this.password) {
      this.errorMsg = this.translate.instant('AUTH.MESSAGES.FILL_EMAIL_PASSWORD');
      this.toast.error(this.errorMsg);
      return;
    }

    const loginRequest: LoginRequest = {
      email: this.email,
      password: this.password,
    };

    this.loading = true;
    this.errorMsg = '';

    // Use actual AuthService
    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.toast.success(this.translate.instant('AUTH.MESSAGES.LOGIN_SUCCESS'));
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = this.translate.instant('AUTH.MESSAGES.LOGIN_FAILED');
        this.toast.error(this.errorMsg);
        this.logger.error('Login error:', err);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
