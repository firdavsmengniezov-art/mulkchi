import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <a routerLink="/" class="auth-logo">Mulkchi<span>.</span></a>

        <h2>Xush kelibsiz 👋</h2>
        <p class="auth-subtitle">Hisobingizga kiring</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="sizning@email.com"
              [class.error]="f['email'].invalid && f['email'].touched">
            <span class="error-msg" *ngIf="f['email'].invalid && f['email'].touched">
              To'g'ri email kiriting
            </span>
          </div>

          <div class="form-group">
            <label>Parol</label>
            <div class="password-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Parolingiz"
                [class.error]="f['password'].invalid && f['password'].touched">
              <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span class="error-msg" *ngIf="f['password'].invalid && f['password'].touched">
              Parol kiritilmadi
            </span>
          </div>

          <div class="error-alert" *ngIf="errorMessage">
            ⚠️ {{ errorMessage }}
          </div>

          <button type="submit" class="btn-gold submit-btn" [disabled]="isLoading">
            <span *ngIf="!isLoading">Kirish</span>
            <span *ngIf="isLoading" class="loading-dots">Yuklanmoqda...</span>
          </button>
        </form>

        <p class="auth-footer">
          Hisob yo'qmi?
          <a routerLink="/register">Ro'yxatdan o'ting</a>
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.snackBar.open('Muvaffaqiyatli kirdingiz!', 'Yopish', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message ?? 'Email yoki parol noto\'g\'ri';
      }
    });
  }
}
