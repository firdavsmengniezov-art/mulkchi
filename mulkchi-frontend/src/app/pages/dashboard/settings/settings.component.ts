import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <div class="settings-page">
      <h1>Sozlamalar</h1>

      <div class="settings-card card-dark">
        <h3>Shaxsiy ma'lumotlar</h3>

        <div class="user-info" *ngIf="user">
          <div class="avatar-circle">{{ getInitials() }}</div>
          <div>
            <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
            <p class="user-email">{{ user.email }}</p>
            <span class="user-role">{{ user.role }}</span>
          </div>
        </div>

        <form [formGroup]="settingsForm" (ngSubmit)="onSave()" class="settings-form">
          <div class="form-row">
            <div class="form-group">
              <label>Ism</label>
              <input type="text" formControlName="firstName" placeholder="Ism">
            </div>
            <div class="form-group">
              <label>Familiya</label>
              <input type="text" formControlName="lastName" placeholder="Familiya">
            </div>
          </div>

          <div class="form-group">
            <label>Telefon</label>
            <input type="tel" formControlName="phone" placeholder="+998 90 123 45 67">
          </div>

          <button type="submit" class="btn-gold save-btn" [disabled]="isLoading">
            {{ isLoading ? 'Saqlanmoqda...' : 'Saqlash' }}
          </button>
        </form>
      </div>

      <div class="danger-zone card-dark">
        <h3>Xavfli zona</h3>
        <p>Hisobdan chiqish barcha qurilmalarda amalga oshiriladi</p>
        <button class="btn-danger" (click)="logout()">🚪 Hisobdan chiqish</button>
      </div>
    </div>
  `,
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  user: User | null = null;
  isLoading = false;

  settingsForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['']
  });

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getProfile(userId).subscribe({
        next: (user) => {
          this.user = user;
          this.settingsForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone
          });
        },
        error: () => {}
      });
    }
  }

  getInitials(): string {
    if (!this.user) return 'U';
    return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
  }

  onSave(): void {
    if (this.settingsForm.invalid || !this.user) return;
    this.isLoading = true;
    const updated: User = { ...this.user, ...this.settingsForm.value };
    this.userService.update(updated).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
        this.snackBar.open('Ma\'lumotlar saqlandi!', 'Yopish', { duration: 3000 });
      },
      error: () => { this.isLoading = false; }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
