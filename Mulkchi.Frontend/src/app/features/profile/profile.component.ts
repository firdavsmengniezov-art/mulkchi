import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { Gender, UserRole, User, HostBadge } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-container">
      <div class="container">
        <div class="profile-header">
          <h1>Mening profilim</h1>
          <p>Shaxsiy ma'lumotlaringizni boshqaring</p>
        </div>

        @if (currentUser()) {
          <div class="profile-content">
            <!-- Profile Sidebar -->
            <aside class="profile-sidebar">
              <mat-card class="profile-card">
                <div class="avatar-section">
                  @if (currentUser()?.avatarUrl) {
                    <img [src]="currentUser()?.avatarUrl" [alt]="currentUser()?.firstName" class="avatar">
                  } @else {
                    <div class="avatar-placeholder">
                      <mat-icon>person</mat-icon>
                    </div>
                  }
                  <button mat-icon-button class="avatar-edit-btn" (click)="uploadAvatar()">
                    <mat-icon>photo_camera</mat-icon>
                  </button>
                </div>

                <div class="user-info">
                  <h2>{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</h2>
                  <p class="email">{{ currentUser()?.email }}</p>
                  
                  @if (currentUser()?.role) {
                    <span class="role-badge" [class]="currentUser()?.role?.toLowerCase()">
                      {{ getRoleLabel(currentUser()?.role) }}
                    </span>
                  }

                  @if (currentUser()?.badge && currentUser()?.role === 'Host') {
                    <div class="host-badge">
                      <mat-icon>stars</mat-icon>
                      <span>{{ getBadgeLabel(currentUser()?.badge) }}</span>
                    </div>
                  }
                </div>

                <mat-divider></mat-divider>

                <div class="user-stats">
                  @if (currentUser()?.role === 'Host') {
                    <div class="stat">
                      <span class="value">{{ currentUser()?.totalListings || 0 }}</span>
                      <span class="label">E'lonlar</span>
                    </div>
                  }
                  <div class="stat">
                    <span class="value">{{ currentUser()?.totalBookings || 0 }}</span>
                    <span class="label">Bronlar</span>
                  </div>
                  @if (currentUser()?.rating) {
                    <div class="stat">
                      <span class="value">{{ currentUser()?.rating }}</span>
                      <span class="label">Reyting</span>
                    </div>
                  }
                </div>

                @if (currentUser()?.isVerified) {
                  <div class="verified-badge">
                    <mat-icon color="primary">verified</mat-icon>
                    <span>Tasdiqlangan foydalanuvchi</span>
                  </div>
                }
              </mat-card>
            </aside>

            <!-- Profile Main Content -->
            <div class="profile-main">
              <mat-card>
                <mat-tab-group>
                  <!-- Personal Info Tab -->
                  <mat-tab label="Shaxsiy ma'lumotlar">
                    <div class="tab-content">
                      <div class="tab-header">
                        <h3>Shaxsiy ma'lumotlar</h3>
                        <button 
                          mat-raised-button 
                          color="primary"
                          (click)="isEditing() ? saveProfile() : toggleEdit()"
                          [disabled]="isSaving()">
                          @if (isSaving()) {
                            <mat-progress-spinner diameter="20" class="inline-spinner"></mat-progress-spinner>
                            <span>Saqlanmoqda...</span>
                          } @else if (isEditing()) {
                            <ng-container>
                              <mat-icon>save</mat-icon>
                              <span>Saqlash</span>
                            </ng-container>
                          } @else {
                            <ng-container>
                              <mat-icon>edit</mat-icon>
                              <span>Tahrirlash</span>
                            </ng-container>
                          }
                        </button>
                      </div>

                      <form [formGroup]="profileForm" class="profile-form">
                        <div class="form-row">
                          <mat-form-field appearance="outline">
                            <mat-label>Ism</mat-label>
                            <input matInput formControlName="firstName" [readonly]="!isEditing()">
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Familiya</mat-label>
                            <input matInput formControlName="lastName" [readonly]="!isEditing()">
                          </mat-form-field>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline">
                            <mat-label>Email</mat-label>
                            <input matInput type="email" formControlName="email" readonly>
                            <mat-icon matSuffix>lock</mat-icon>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Telefon</mat-label>
                            <input matInput formControlName="phone" [readonly]="!isEditing()">
                          </mat-form-field>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline">
                            <mat-label>Tug'ilgan sana</mat-label>
                            <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" [readonly]="!isEditing()">
                            <mat-datepicker-toggle matSuffix [for]="picker" [disabled]="!isEditing()"></mat-datepicker-toggle>
                            <mat-datepicker #picker></mat-datepicker>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Jins</mat-label>
                            <mat-select formControlName="gender" [disabled]="!isEditing()">
                              <mat-option [value]="'Male'">Erkak</mat-option>
                              <mat-option [value]="'Female'">Ayol</mat-option>
                              <mat-option [value]="'Other'">Boshqa</mat-option>
                            </mat-select>
                          </mat-form-field>
                        </div>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Manzil</mat-label>
                          <textarea matInput formControlName="address" rows="3" [readonly]="!isEditing()"></textarea>
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Bio</mat-label>
                          <textarea matInput formControlName="bio" rows="4" [readonly]="!isEditing()" placeholder="O'zingiz haqingizda qisqacha ma'lumot..."></textarea>
                        </mat-form-field>

                        @if (isEditing()) {
                          <div class="form-actions">
                            <button mat-button type="button" (click)="toggleEdit()">Bekor qilish</button>
                          </div>
                        }
                      </form>
                    </div>
                  </mat-tab>

                  <!-- Security Tab -->
                  <mat-tab label="Xavfsizlik">
                    <div class="tab-content">
                      <h3>Parolni o'zgartirish</h3>
                      
                      <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="password-form">
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Joriy parol</mat-label>
                          <input matInput type="password" formControlName="currentPassword">
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Yangi parol</mat-label>
                          <input matInput type="password" formControlName="newPassword">
                        </mat-form-field>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Yangi parolni tasdiqlash</mat-label>
                          <input matInput type="password" formControlName="confirmPassword">
                          @if (passwordForm.hasError('mismatch')) {
                            <mat-error>Parollar mos kelmadi</mat-error>
                          }
                        </mat-form-field>

                        <button 
                          mat-raised-button 
                          color="primary" 
                          type="submit"
                          [disabled]="passwordForm.invalid || isChangingPassword()">
                          @if (isChangingPassword()) {
                            <mat-progress-spinner diameter="20" class="inline-spinner"></mat-progress-spinner>
                            <span>O'zgartirilmoqda...</span>
                          } @else {
                            <span>Parolni o'zgartirish</span>
                          }
                        </button>
                      </form>
                    </div>
                  </mat-tab>

                  <!-- Settings Tab -->
                  <mat-tab label="Sozlamalar">
                    <div class="tab-content">
                      <h3>Til sozlamalari</h3>
                      
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Interfeys tili</mat-label>
                        <mat-select [(value)]="selectedLanguage" (selectionChange)="changeLanguage($event)">
                          <mat-option value="uz">O'zbekcha</mat-option>
                          <mat-option value="ru">Русский</mat-option>
                          <mat-option value="en">English</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-divider class="section-divider"></mat-divider>

                      <h3>Foydalanuvchi rejimi</h3>
                      
                      <div class="mode-switch-section">
                        <p class="mode-description">
                          Hozirgi rejim: <strong>{{ getCurrentModeLabel() }}</strong>
                        </p>
                        @if (currentUser()?.role === 'Guest') {
                          <button 
                            mat-raised-button 
                            color="accent"
                            (click)="switchToHostMode()"
                            [disabled]="isSwitchingMode()">
                            @if (isSwitchingMode()) {
                              <mat-progress-spinner diameter="20" class="inline-spinner"></mat-progress-spinner>
                              <span>O'tilmoqda...</span>
                            } @else {
                              <ng-container>
                                <mat-icon>switch_account</mat-icon>
                                <span>Host rejimga o'tish</span>
                              </ng-container>
                            }
                          </button>
                          <p class="mode-hint">E'lon joylashtirish uchun Host rejimga o'ting</p>
                        }
                        @if (currentUser()?.role === 'Host') {
                          <button 
                            mat-stroked-button
                            (click)="navigateToHostDashboard()">
                            <mat-icon>dashboard</mat-icon>
                            <span>Host boshqaruv paneli</span>
                          </button>
                        }
                      </div>

                      <mat-divider class="section-divider"></mat-divider>

                      <h3>Bildirishnomalar</h3>
                      
                      <div class="notification-settings">
                        <div class="setting-item">
                          <span>Email bildirishnomalari</span>
                          <mat-icon color="primary">toggle_on</mat-icon>
                        </div>
                        <div class="setting-item">
                          <span>SMS bildirishnomalari</span>
                          <mat-icon color="primary">toggle_on</mat-icon>
                        </div>
                        <div class="setting-item">
                          <span>Marketing xabarlari</span>
                          <mat-icon>toggle_off</mat-icon>
                        </div>
                      </div>

                      <mat-divider class="section-divider"></mat-divider>

                      <h3 class="danger-zone">Xavfli zona</h3>
                      
                      <div class="danger-actions">
                        <button mat-stroked-button color="warn" (click)="deleteAccount()">
                          <mat-icon>delete_forever</mat-icon>
                          Akkauntni o'chirish
                        </button>
                      </div>
                    </div>
                  </mat-tab>
                </mat-tab-group>
              </mat-card>
            </div>
          </div>
        } @else {
          <div class="loading-container">
            <mat-progress-spinner diameter="50"></mat-progress-spinner>
            <p>Yuklanmoqda...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
      padding: 40px 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .profile-header {
      margin-bottom: 32px;
    }

    .profile-header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .profile-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .profile-content {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 24px;
    }

    .profile-sidebar {
      height: fit-content;
    }

    .profile-card {
      padding: 24px;
    }

    .avatar-section {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
    }

    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #e0e0e0;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #999;
    }

    .avatar-edit-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: white !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .user-info {
      text-align: center;
      margin-bottom: 24px;
    }

    .user-info h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .user-info .email {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .role-badge.guest {
      background: #e3f2fd;
      color: #1976d2;
    }

    .role-badge.host {
      background: #e8f5e9;
      color: #388e3c;
    }

    .role-badge.admin {
      background: #fff3e0;
      color: #f57c00;
    }

    .host-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-top: 8px;
      color: #ffa500;
      font-size: 0.9rem;
    }

    .user-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      text-align: center;
    }

    .stat .value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
    }

    .stat .label {
      font-size: 0.8rem;
      color: #666;
    }

    .verified-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
      padding: 12px;
      background: #e8f5e9;
      border-radius: 8px;
      color: #4caf50;
    }

    .profile-main mat-card {
      min-height: 600px;
    }

    .tab-content {
      padding: 24px;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .tab-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .password-form {
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-divider {
      margin: 32px 0;
    }

    .notification-settings {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
    }

    .danger-zone {
      color: #f44336;
    }

    .danger-actions {
      margin-top: 16px;
    }

    .inline-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
    }

    @media (max-width: 1024px) {
      .profile-content {
        grid-template-columns: 1fr;
      }

      .profile-sidebar {
        max-width: 400px;
        margin: 0 auto;
      }
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .tab-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }

    .mode-switch-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .mode-description {
      font-size: 1rem;
      color: #333;
      margin: 0;
    }

    .mode-hint {
      font-size: 0.875rem;
      color: #666;
      margin: 8px 0 0 0;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  isEditing = signal(false);
  isSaving = signal(false);
  isChangingPassword = signal(false);
  isSwitchingMode = signal(false);
  selectedLanguage = signal(this.currentUser()?.preferredLanguage || 'uz');

  Gender = Gender;
  UserRole = UserRole;

  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    phone: [''],
    dateOfBirth: [''],
    gender: ['' as Gender],
    address: [''],
    bio: ['']
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || 'Other',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }

  toggleEdit(): void {
    this.isEditing.update(v => !v);
    if (!this.isEditing()) {
      this.loadUserData(); // Reset form
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);

    const updateData = {
      firstName: this.profileForm.value.firstName!,
      lastName: this.profileForm.value.lastName!,
      phone: this.profileForm.value.phone || undefined,
      dateOfBirth: this.profileForm.value.dateOfBirth ? new Date(this.profileForm.value.dateOfBirth) : undefined,
      gender: this.profileForm.value.gender as Gender,
      address: this.profileForm.value.address || undefined,
      bio: this.profileForm.value.bio || undefined
    };

    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.snackBar.open('Profil yangilandi', 'Yopish', { duration: 3000 });
      },
      error: () => {
        this.isSaving.set(false);
        this.snackBar.open('Xatolik yuz berdi', 'Yopish', { duration: 3000 });
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isChangingPassword.set(true);
    
    // Simulate API call
    setTimeout(() => {
      this.isChangingPassword.set(false);
      this.passwordForm.reset();
      this.snackBar.open('Parol o\'zgartirildi', 'Yopish', { duration: 3000 });
    }, 1500);
  }

  uploadAvatar(): void {
    this.snackBar.open('Rasm yuklash funksiyasi tez orada qo\'shiladi', 'Yopish', { duration: 3000 });
  }

  changeLanguage(lang: any): void {
    this.selectedLanguage.set(lang.value);
    this.snackBar.open('Til o\'zgartirildi', 'Yopish', { duration: 2000 });
  }

  deleteAccount(): void {
    if (confirm('Haqiqatan ham akkauntni o\'chirmoqchimisiz? Bu amal qaytarib bo\'lmaydi.')) {
      this.snackBar.open('Akkaunt o\'chirish so\'rovi yuborildi', 'Yopish', { duration: 3000 });
    }
  }

  getRoleLabel(role?: UserRole): string {
    switch (role) {
      case 'Guest': return 'Mehmon';
      case 'Host': return 'Host';
      case 'Admin': return 'Admin';
      case 'SuperAdmin': return 'Super Admin';
      default: return 'Foydalanuvchi';
    }
  }

  getBadgeLabel(badge: HostBadge | undefined): string {
    if (!badge) return '';
    const labels: Record<HostBadge, string> = {
      [HostBadge.New]: 'Yangi',
      [HostBadge.Rising]: 'Rivojlanayotgan',
      [HostBadge.Super]: 'Super',
      [HostBadge.Legend]: 'Afsona'
    };
    return labels[badge] || badge;
  }

  getCurrentModeLabel(): string {
    const role = this.currentUser()?.role;
    const labels: Record<string, string> = {
      'Guest': 'Mehmon (Guest)',
      'Host': 'Uy egasi (Host)',
      'Admin': 'Administrator'
    };
    return labels[role || ''] || role || 'Noma\'lum';
  }

  switchToHostMode(): void {
    this.isSwitchingMode.set(true);
    
    this.authService.switchMode({ targetMode: UserRole.Host }).subscribe({
      next: (response) => {
        this.isSwitchingMode.set(false);
        this.snackBar.open('Host rejimga muvaffaqiyatli o\'tdingiz!', 'Yopish', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        // Reload page to refresh role state
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: (error) => {
        this.isSwitchingMode.set(false);
        const errorMsg = error?.error?.message || 'Rejim almashtirishda xatolik';
        this.snackBar.open(errorMsg, 'Yopish', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  navigateToHostDashboard(): void {
    this.router.navigate(['/host']);
  }

  passwordMatchValidator(formGroup: any): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }
}
