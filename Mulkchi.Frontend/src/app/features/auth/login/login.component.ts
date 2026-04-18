import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Tizimga kirish</mat-card-title>
          <mat-card-subtitle>Akkauntingizga kiring</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-field">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="email@example.com">
                <mat-icon matPrefix>email</mat-icon>
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                  <mat-error>
                    @if (loginForm.get('email')?.hasError('required')) {
                      Email kiritilishi shart
                    } @else if (loginForm.get('email')?.hasError('email')) {
                      Noto'g'ri email format
                    }
                  </mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-field">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Parol</mat-label>
                <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="togglePasswordVisibility()">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                  <mat-error>Parol kiritilishi shart</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-options">
              <mat-checkbox formControlName="rememberMe">Meni eslab qolish</mat-checkbox>
              <a mat-button color="primary" routerLink="/auth/forgot-password">Parolni unutdingizmi?</a>
            </div>

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
              [disabled]="loginForm.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
                <span>Kirish...</span>
              } @else {
                <span>Kirish</span>
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="login-actions">
          <p>Akkauntingiz yo'qmi? <a mat-button color="primary" routerLink="/auth/register">Ro'yxatdan o'tish</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
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
      font-size: 1rem;
      color: #666;
    }

    .full-width {
      width: 100%;
    }

    .form-field {
      margin-bottom: 16px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 8px;
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

    .login-actions {
      justify-content: center;
      padding-top: 16px;
    }

    .login-actions p {
      margin: 0;
      color: #666;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 24px;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  hidePassword = signal(true);

  private returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({
      email: email!,
      password: password!
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open('Tizimga muvaffaqiyatli kirdingiz!', 'Yopish', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login qilishda xatolik yuz berdi');
      }
    });
  }
}
