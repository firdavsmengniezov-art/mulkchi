import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  token = '';
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  submitted = false;
  errorMsg = '';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggingService);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';

    if (!this.token) {
      this.errorMsg = 'Reset havolasi topilmadi. Emailingizdagi havolani qayta oching.';
    }
  }

  resetPassword(): void {
    if (!this.token) {
      this.errorMsg = 'Reset havolasi topilmadi. Emailingizdagi havolani qayta oching.';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMsg = "Ikkala parol maydonini ham to'ldiring";
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMsg = "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Parollar mos kelmadi';
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.errorMsg =
          err.error?.message ??
          "Parolni tiklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
        this.logger.error('Reset password error:', err);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
