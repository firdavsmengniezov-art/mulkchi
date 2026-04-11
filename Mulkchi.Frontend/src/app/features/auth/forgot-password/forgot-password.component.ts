import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  submitted = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private logger: LoggingService,
  ) {}

  sendResetSms(): void {
    const normalizedEmail = this.email.trim().toLowerCase();

    if (!normalizedEmail) {
      this.errorMsg = 'Email kiriting';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      this.errorMsg = "Email formati noto'g'ri";
      return;
    }

    this.errorMsg = '';
    this.loading = true;
    this.email = normalizedEmail;

    this.authService.forgotPassword(normalizedEmail).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.errorMsg =
          err.error?.message ??
          "So'rov yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
        this.logger.error('Forgot password error:', err);
      },
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.email = '';
    this.errorMsg = '';
  }
}
