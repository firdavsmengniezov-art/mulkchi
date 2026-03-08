import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';
  if (!value) return null;
  if (value.length < 8) return { weakPassword: 'minLength' };
  if (!/[A-Z]/.test(value)) return { weakPassword: 'uppercase' };
  if (!/[a-z]/.test(value)) return { weakPassword: 'lowercase' };
  if (!/[0-9]/.test(value)) return { weakPassword: 'digit' };
  return null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <a routerLink="/" class="auth-logo">Mulkchi<span>.</span></a>

        <h2>Hisob yarating 🏠</h2>
        <p class="auth-subtitle">Platformamizga qo'shiling</p>

        <form
          [formGroup]="registerForm"
          (ngSubmit)="onSubmit()"
          class="auth-form"
        >
          <div class="form-row">
            <div class="form-group">
              <label>Ism</label>
              <input
                type="text"
                formControlName="firstName"
                placeholder="Ism"
                [class.error]="f['firstName'].invalid && f['firstName'].touched"
              />
            </div>
            <div class="form-group">
              <label>Familiya</label>
              <input
                type="text"
                formControlName="lastName"
                placeholder="Familiya"
                [class.error]="f['lastName'].invalid && f['lastName'].touched"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="sizning@email.com"
              [class.error]="f['email'].invalid && f['email'].touched"
            />
            <span
              class="error-msg"
              *ngIf="f['email'].invalid && f['email'].touched"
            >
              To'g'ri email kiriting
            </span>
          </div>

          <div class="form-group">
            <label>Muloqot tili</label>
            <select
              formControlName="preferredLanguage"
              class="lang-select"
              [class.error]="
                f['preferredLanguage'].invalid && f['preferredLanguage'].touched
              "
            >
              <option value="uz">O'zbekcha</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="form-group">
            <label>Telefon</label>
            <input
              type="tel"
              formControlName="phone"
              placeholder="+998 90 123 45 67"
              [class.error]="f['phone'].invalid && f['phone'].touched"
            />
          </div>

          <div class="form-group">
            <label>Parol</label>
            <div class="password-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Parol kiriting"
                [class.error]="f['password'].invalid && f['password'].touched"
              />
              <button
                type="button"
                class="eye-btn"
                (click)="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span class="password-hint"
              >Min 8 ta belgi, katta harf va raqam</span
            >
            <span
              class="error-msg"
              *ngIf="f['password'].invalid && f['password'].touched"
            >
              <ng-container *ngIf="f['password'].errors?.['required']; else strengthError">Parol kiritilmadi</ng-container>
              <ng-template #strengthError>
                <ng-container [ngSwitch]="f['password'].errors?.['weakPassword']">
                  <ng-container *ngSwitchCase="'minLength'">Parol kamida 8 ta belgidan iborat bo'lishi kerak</ng-container>
                  <ng-container *ngSwitchCase="'uppercase'">Parolda kamida 1 ta katta harf (A-Z) bo'lishi kerak</ng-container>
                  <ng-container *ngSwitchCase="'lowercase'">Parolda kamida 1 ta kichik harf (a-z) bo'lishi kerak</ng-container>
                  <ng-container *ngSwitchCase="'digit'">Parolda kamida 1 ta raqam (0-9) bo'lishi kerak</ng-container>
                </ng-container>
              </ng-template>
            </span>
          </div>

          <div class="error-alert" *ngIf="errorMessage">
            ⚠️ {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn-gold submit-btn"
            [disabled]="isLoading"
          >
            <span *ngIf="!isLoading">Ro'yxatdan o'tish →</span>
            <span *ngIf="isLoading">Yuklanmoqda...</span>
          </button>
        </form>

        <p class="auth-footer">
          Hisob bormi?
          <a routerLink="/login">Kirish</a>
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.scss'],
  styles: [
    `
      .lang-select {
        width: 100%;
        padding: 12px;
        border-radius: 12px;
        background: #1e1e1e; /* To'q rangli fon (loyihangizga qarab o'zgartiring) */
        color: white; /* Matn rangi oq */
        border: 1px solid #444;
        font-size: 14px;
        outline: none;
        cursor: pointer;
        appearance: auto; /* Brauzerning standart strelkasini chiqaradi */
        margin-bottom: 10px;
      }
      .lang-select:focus {
        border-color: #c9a84c;
      }
      .lang-select.error {
        border-color: #ff4d4d;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #aaa;
      }
    `,
  ],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    preferredLanguage: ['uz', [Validators.required]],
  });

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.snackBar.open("Muvaffaqiyatli ro'yxatdan o'tdingiz!", 'Yopish', {
          duration: 3000,
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message ?? "Ro'yxatdan o'tishda xatolik yuz berdi";
      },
    });
  }
}
