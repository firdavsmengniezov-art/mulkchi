import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule, StepperOrientation } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models';

@Component({
  selector: 'app-register',
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
    MatSelectModule,
    MatStepperModule
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Ro'yxatdan o'tish</mat-card-title>
          <mat-card-subtitle>Yangi akkaunt yarating</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-stepper [orientation]="stepperOrientation()" linear #stepper>
            <!-- Step 1: Personal Info -->
            <mat-step [stepControl]="personalInfoForm" label="Shaxsiy ma'lumotlar">
              <form [formGroup]="personalInfoForm">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Ism</mat-label>
                    <input matInput formControlName="firstName" placeholder="Ismingiz">
                    <mat-icon matPrefix>person</mat-icon>
                    @if (personalInfoForm.get('firstName')?.invalid && personalInfoForm.get('firstName')?.touched) {
                      <mat-error>Ism kiritilishi shart</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Familiya</mat-label>
                    <input matInput formControlName="lastName" placeholder="Familiyangiz">
                    <mat-icon matPrefix>person_outline</mat-icon>
                    @if (personalInfoForm.get('lastName')?.invalid && personalInfoForm.get('lastName')?.touched) {
                      <mat-error>Familiya kiritilishi shart</mat-error>
                    }
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="email@example.com">
                  <mat-icon matPrefix>email</mat-icon>
                  @if (personalInfoForm.get('email')?.invalid && personalInfoForm.get('email')?.touched) {
                    <mat-error>
                      @if (personalInfoForm.get('email')?.hasError('required')) {
                        Email kiritilishi shart
                      } @else if (personalInfoForm.get('email')?.hasError('email')) {
                        Noto'g'ri email format
                      }
                    </mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Telefon</mat-label>
                  <input matInput formControlName="phone" placeholder="+998 90 123 45 67">
                  <mat-icon matPrefix>phone</mat-icon>
                </mat-form-field>

                <div class="step-actions">
                  <button mat-raised-button color="primary" matStepperNext type="button">
                    Keyingisi
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Account Info -->
            <mat-step [stepControl]="accountInfoForm" label="Akkount ma'lumotlari">
              <form [formGroup]="accountInfoForm">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Parol</mat-label>
                  <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password">
                  <mat-icon matPrefix>lock</mat-icon>
                  <button mat-icon-button matSuffix type="button" (click)="togglePasswordVisibility()">
                    <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (accountInfoForm.get('password')?.invalid && accountInfoForm.get('password')?.touched) {
                    <mat-error>
                      @if (accountInfoForm.get('password')?.hasError('required')) {
                        Parol kiritilishi shart
                      } @else if (accountInfoForm.get('password')?.hasError('minlength')) {
                        Parol kamida 6 ta belgidan iborat bo'lishi kerak
                      }
                    </mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Parolni tasdiqlash</mat-label>
                  <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="confirmPassword">
                  <mat-icon matPrefix>lock_outline</mat-icon>
                  @if (accountInfoForm.get('confirmPassword')?.invalid && accountInfoForm.get('confirmPassword')?.touched) {
                    <mat-error>
                      @if (accountInfoForm.get('confirmPassword')?.hasError('required')) {
                        Parolni tasdiqlang
                      } @else if (accountInfoForm.hasError('passwordMismatch')) {
                        Parollar mos kelmadi
                      }
                    </mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Foydalanuvchi turi</mat-label>
                  <mat-select formControlName="role">
                    <mat-option [value]="'Guest'">Mehmon (ijaraga olish)</mat-option>
                    <mat-option [value]="'Host'">Host (mulk beruvchi)</mat-option>
                  </mat-select>
                  <mat-icon matPrefix>account_circle</mat-icon>
                </mat-form-field>

                @if (accountInfoForm.hasError('passwordMismatch') && accountInfoForm.touched) {
                  <div class="error-message">
                    <mat-icon color="warn">error</mat-icon>
                    <span>Parollar mos kelmadi</span>
                  </div>
                }

                <div class="step-actions">
                  <button mat-button matStepperPrevious type="button">Orqaga</button>
                  <button mat-raised-button color="primary" matStepperNext type="button">
                    Keyingisi
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Confirmation -->
            <mat-step label="Tasdiqlash">
              <div class="confirmation-content">
                <h3>Ma'lumotlaringizni tekshiring</h3>
                
                <div class="confirmation-item">
                  <span class="label">Ism:</span>
                  <span class="value">{{ personalInfoForm.value.firstName }}</span>
                </div>
                <div class="confirmation-item">
                  <span class="label">Familiya:</span>
                  <span class="value">{{ personalInfoForm.value.lastName }}</span>
                </div>
                <div class="confirmation-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ personalInfoForm.value.email }}</span>
                </div>
                <div class="confirmation-item">
                  <span class="label">Telefon:</span>
                  <span class="value">{{ personalInfoForm.value.phone || 'Kiritilmagan' }}</span>
                </div>
                <div class="confirmation-item">
                  <span class="label">Foydalanuvchi turi:</span>
                  <span class="value">{{ accountInfoForm.value.role === 'Host' ? 'Host' : 'Mehmon' }}</span>
                </div>

                @if (errorMessage()) {
                  <div class="error-alert">
                    <mat-icon color="warn">error</mat-icon>
                    <span>{{ errorMessage() }}</span>
                  </div>
                }

                <div class="step-actions">
                  <button mat-button matStepperPrevious type="button" [disabled]="isLoading()">Orqaga</button>
                  <button 
                    mat-raised-button 
                    color="primary" 
                    type="button"
                    (click)="onSubmit()"
                    [disabled]="isLoading()">
                    @if (isLoading()) {
                      <mat-spinner diameter="20" class="inline-spinner"></mat-spinner>
                      <span>Ro'yxatdan o'tish...</span>
                    } @else {
                      <span>Ro'yxatdan o'tish</span>
                    }
                  </button>
                </div>
              </div>
            </mat-step>
          </mat-stepper>
        </mat-card-content>

        <mat-card-actions class="register-actions">
          <p>Akkauntingiz bormi? <a mat-button color="primary" routerLink="/auth/login">Kirish</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      width: 100%;
      max-width: 600px;
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
      margin-bottom: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 0;
    }

    .half-width {
      width: 50%;
    }

    .step-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .step-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .confirmation-content {
      padding: 16px 0;
    }

    .confirmation-content h3 {
      margin-bottom: 24px;
      color: #333;
    }

    .confirmation-item {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .confirmation-item .label {
      width: 150px;
      font-weight: 500;
      color: #666;
    }

    .confirmation-item .value {
      flex: 1;
      color: #333;
    }

    .error-message,
    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffebee;
      color: #c62828;
      padding: 12px 16px;
      border-radius: 4px;
      margin: 16px 0;
    }

    .inline-spinner {
      display: inline-block;
    }

    .register-actions {
      justify-content: center;
      padding-top: 16px;
    }

    .register-actions p {
      margin: 0;
      color: #666;
    }

    @media (max-width: 600px) {
      .register-card {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }

      .confirmation-item {
        flex-direction: column;
        gap: 4px;
      }

      .confirmation-item .label {
        width: auto;
      }

      .step-actions {
        flex-direction: column;
      }

      .step-actions button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private breakpointObserver = inject(BreakpointObserver);

  personalInfoForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  accountInfoForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    role: ['Guest' as UserRole, Validators.required]
  }, { validators: this.passwordMatchValidator });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  hidePassword = signal(true);

  stepperOrientation: Observable<StepperOrientation> = this.breakpointObserver
    .observe('(min-width: 600px)')
    .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

  stepperOrientationSignal = toSignal(this.stepperOrientation, { initialValue: 'horizontal' as StepperOrientation });

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.personalInfoForm.invalid || this.accountInfoForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const registerData = {
      firstName: this.personalInfoForm.value.firstName!,
      lastName: this.personalInfoForm.value.lastName!,
      email: this.personalInfoForm.value.email!,
      phone: this.personalInfoForm.value.phone || undefined,
      password: this.accountInfoForm.value.password!,
      confirmPassword: this.accountInfoForm.value.confirmPassword!,
      role: this.accountInfoForm.value.role as UserRole
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.snackBar.open('Ro\'yxatdan o\'tish muvaffaqiyatli!', 'Yopish', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
      }
    });
  }
}
