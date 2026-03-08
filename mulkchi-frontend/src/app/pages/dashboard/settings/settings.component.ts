import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User } from '../../../core/models/user.models';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { UserService } from '../../../core/services/user.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  template: `
    <div class="settings-page">
      <h1>{{ 'settings.title' | translate }}</h1>

      <div class="settings-card card-dark">
        <h3>{{ 'settings.personal_info' | translate }}</h3>

        <div class="user-info" *ngIf="user">
          <div class="avatar-circle">{{ getInitials() }}</div>
          <div>
            <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
            <p class="user-email">{{ user.email }}</p>
            <span class="user-role">{{ user.role }}</span>
          </div>
        </div>

        <form
          [formGroup]="settingsForm"
          (ngSubmit)="onSave()"
          class="settings-form"
        >
          <div class="form-row">
            <div class="form-group">
              <label>{{ 'settings.first_name' | translate }}</label>
              <input type="text" formControlName="firstName" />
            </div>
            <div class="form-group">
              <label>{{ 'settings.last_name' | translate }}</label>
              <input type="text" formControlName="lastName" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ 'settings.phone' | translate }}</label>
            <input
              type="tel"
              formControlName="phone"
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div class="form-group">
            <label>{{ 'settings.language' | translate }}</label>
            <div class="lang-selector">
              <button
                type="button"
                class="lang-option"
                [class.selected]="
                  settingsForm.get('preferredLanguage')?.value === 'uz'
                "
                (click)="setLang('uz')"
              >
                🇺🇿 O'zbekcha
              </button>
              <button
                type="button"
                class="lang-option"
                [class.selected]="
                  settingsForm.get('preferredLanguage')?.value === 'ru'
                "
                (click)="setLang('ru')"
              >
                🇷🇺 Русский
              </button>
              <button
                type="button"
                class="lang-option"
                [class.selected]="
                  settingsForm.get('preferredLanguage')?.value === 'en'
                "
                (click)="setLang('en')"
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn-gold save-btn"
            [disabled]="isLoading"
          >
            {{
              isLoading
                ? ('settings.saving' | translate)
                : ('settings.save' | translate)
            }}
          </button>
        </form>
      </div>

      <div class="danger-zone card-dark">
        <h3>{{ 'settings.danger_zone' | translate }}</h3>
        <p>{{ 'settings.danger_desc' | translate }}</p>
        <button class="btn-danger" (click)="logout()">
          {{ 'settings.logout_btn' | translate }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly langService = inject(LanguageService);

  user: User | null = null;
  isLoading = false;

  settingsForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    preferredLanguage: ['uz', Validators.required],
  });

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getProfile(userId).subscribe({
        next: (user) => {
          this.user = user;
          const lang = user.preferredLanguage || 'uz';
          this.settingsForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            preferredLanguage: lang,
          });
          this.langService.setLanguage(lang);
        },
        error: () => {},
      });
    }
  }

  setLang(lang: string): void {
    this.settingsForm.patchValue({ preferredLanguage: lang });
    this.langService.setLanguage(lang);
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
        this.snackBar.open(
          this.langService.t('settings.saved'),
          this.langService.t('settings.close'),
          { duration: 3000 },
        );
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
