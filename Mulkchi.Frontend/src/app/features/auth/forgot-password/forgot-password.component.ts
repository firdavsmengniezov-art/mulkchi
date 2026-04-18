import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="forgot-password-container">
      <mat-card class="forgot-password-card">
        <mat-card-header>
          <mat-card-title>Parolni tiklash</mat-card-title>
          <mat-card-subtitle>Email manzilingizni kiriting, biz sizga tiklash havolasini yuboramiz</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (!isSuccess()) {
            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="email@example.com">
                <mat-icon matPrefix>email</mat-icon>
                @if (forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched) {
                  <mat-error>
                    @if (forgotForm.get('email')?.hasError('required')) {
                      Email kiritilishi shart
                    } @else if (forgotForm.get('email')?.hasError('email')) {
                      Noto'g'ri email format
                    }
                  </mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <div class="error-alert">
                  <mat-icon color="warn">error</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                class="full-width submit-btn"
                [disabled]="forgotForm.invalid || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
                  <span>Yuborilmoqda...</span>
                } @else {
                  <mat-icon>send</mat-icon>
                  <span>Havolani yuborish</span>
                }
              </button>
            </form>
          } @else {
            <div class="success-message">
              <mat-icon color="primary">check_circle</mat-icon>
              <h3>Email yuborildi!</h3>
              <p>Parolni tiklash uchun ko'rsatmalarni o'qib chiqing va email manzilingizni tekshiring.</p>
              <button mat-raised-button color="primary" routerLink="/auth/login">
                Kirish sahifasiga qaytish
              </button>
            </div>
          }
        </mat-card-content>

        <mat-card-actions class="forgot-password-actions">
          <p>Parolingiz esdami? <a mat-button color="primary" routerLink="/auth/login">Kirish</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .forgot-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .forgot-password-card {
      width: 100%;
      max-width: 450px;
      padding: 32px;
    }

    mat-card-header {
      text-align: center;
      display: block;
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    mat-card-subtitle {
      font-size: 0.95rem;
      color: #666;
      line-height: 1.5;
    }

    .full-width {
      width: 100%;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .submit-btn {
      height: 48px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .inline-spinner {
      display: inline-block;
    }

    .success-message {
      text-align: center;
      padding: 32px 16px;
    }

    .success-message mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .success-message h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: #333;
    }

    .success-message p {
      color: #666;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .forgot-password-actions {
      justify-content: center;
      padding-top: 16px;
    }

    .forgot-password-actions p {
      margin: 0;
      color: #666;
    }

    @media (max-width: 480px) {
      .forgot-password-card {
        padding: 24px;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const email = this.forgotForm.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Xatolik yuz berdi, qayta urinib ko\'ring');
      }
    });
  }
}
