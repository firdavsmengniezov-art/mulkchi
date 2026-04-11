import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserResponse, UserUpdateDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AvatarUploadComponent } from './avatar-upload.component';
import { ProfileEditComponent } from './profile-edit.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    AvatarUploadComponent,
    ProfileEditComponent,
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-[var(--mulk-bg)]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div *ngIf="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>

        <div *ngIf="!loading && user" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Sidebar -->
          <aside class="lg:col-span-3">
            <nav
              class="bg-white rounded-2xl border border-[var(--mulk-border)] p-2 shadow-sm sticky top-24"
            >
              <a
                class="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition"
                [class.bg-brand]="activeSidebar === 'profile'"
                [class.text-white]="activeSidebar === 'profile'"
                [class.text-dark]="activeSidebar !== 'profile'"
                [class.hover:bg-gray-100]="activeSidebar !== 'profile'"
                (click)="setSidebar('profile')"
              >
                <span>👤</span>
                <span>Profil</span>
              </a>

              <a
                routerLink="/payments"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-dark font-medium hover:bg-gray-100 transition"
              >
                <span>💳</span>
                <span>Balans</span>
              </a>

              <a
                routerLink="/chat"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-dark font-medium hover:bg-gray-100 transition"
              >
                <span>💬</span>
                <span>Xabarlar</span>
              </a>

              <a
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-dark font-medium hover:bg-gray-100 transition"
                (click)="setSidebar('settings')"
              >
                <span>⚙️</span>
                <span>Sozlamalar</span>
              </a>
            </nav>
          </aside>

          <!-- Main -->
          <section class="lg:col-span-9 space-y-6">
            <!-- Profile Header Card -->
            <div
              class="bg-white rounded-2xl border border-[var(--mulk-border)] shadow-sm p-4 sm:p-6"
            >
              <div class="flex flex-col lg:flex-row lg:items-center gap-6">
                <div class="flex-shrink-0">
                  <app-avatar-upload
                    [avatarUrl]="user.avatarUrl"
                    [isUploading]="uploadingAvatar"
                    (fileSelected)="onAvatarSelected($event)"
                  >
                  </app-avatar-upload>
                </div>

                <div class="flex-1">
                  <h1 class="text-2xl font-bold text-dark">
                    {{ user.firstName }} {{ user.lastName }}
                  </h1>
                  <p class="text-sm text-gray-500 mt-1">{{ user.email }}</p>
                  <p class="text-sm text-gray-500">
                    A'zo bo'lgan: {{ user.createdDate | date: 'longDate' }}
                  </p>
                  <p class="text-sm text-gray-500" *ngIf="user.phoneNumber">
                    {{ user.phoneNumber }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="px-4 py-2 rounded-xl border border-gray-200 text-dark font-semibold hover:bg-gray-50 transition"
                  >
                    Ulashish
                  </button>
                  <button
                    type="button"
                    (click)="editing = true"
                    *ngIf="!editing"
                    class="px-4 py-2 rounded-xl bg-brand text-white font-semibold hover:opacity-90 transition"
                  >
                    Profilni tahrirlash
                  </button>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white rounded-xl border border-[var(--mulk-border)] p-4 shadow-sm">
                <p class="text-xs text-gray-500 uppercase tracking-wide">E'lonlar</p>
                <p class="text-2xl font-bold text-dark mt-1">{{ user.propertiesCount ?? 0 }}</p>
              </div>
              <div class="bg-white rounded-xl border border-[var(--mulk-border)] p-4 shadow-sm">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Ko'rishlar</p>
                <p class="text-2xl font-bold text-dark mt-1">0</p>
              </div>
              <div class="bg-white rounded-xl border border-[var(--mulk-border)] p-4 shadow-sm">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Qo'ng'iroqlar</p>
                <p class="text-2xl font-bold text-dark mt-1">0</p>
              </div>
              <div class="bg-white rounded-xl border border-[var(--mulk-border)] p-4 shadow-sm">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Reyting</p>
                <p class="text-2xl font-bold text-dark mt-1">{{ user.averageRating ?? 0 }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                routerLink="/properties/create"
                class="bg-white rounded-xl border border-[var(--mulk-border)] p-4 shadow-sm hover:shadow transition block"
              >
                <p class="text-xs uppercase tracking-wide text-gray-500">Tezkor amal</p>
                <p class="text-base font-semibold text-dark mt-1">Yangi e'lon qo'shish</p>
                <p class="text-sm text-gray-500 mt-1">
                  Sotish yoki ijaraga berish uchun e'lon yarating.
                </p>
              </a>

              <a
                routerLink="/payments"
                class="bg-white rounded-xl border border-[var(--mulk-border)] p-4 shadow-sm hover:shadow transition block"
              >
                <p class="text-xs uppercase tracking-wide text-gray-500">Tezkor amal</p>
                <p class="text-base font-semibold text-dark mt-1">Balans va to'lovlar</p>
                <p class="text-sm text-gray-500 mt-1">To'lov tarixi va holatlarni tekshiring.</p>
              </a>

              <a
                routerLink="/favorites"
                class="bg-white rounded-xl border border-[var(--mulk-border)] p-4 shadow-sm hover:shadow transition block"
              >
                <p class="text-xs uppercase tracking-wide text-gray-500">Tezkor amal</p>
                <p class="text-base font-semibold text-dark mt-1">Tanlangan mulklar</p>
                <p class="text-sm text-gray-500 mt-1">Saqlangan e'lonlarni tez oching.</p>
              </a>
            </div>

            <!-- Tabs -->
            <div
              class="bg-white rounded-2xl border border-[var(--mulk-border)] shadow-sm overflow-hidden"
            >
              <div class="border-b border-gray-100 p-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg font-medium transition"
                  [class.bg-brand]="activeTab === 'listings'"
                  [class.text-white]="activeTab === 'listings'"
                  [class.text-dark]="activeTab !== 'listings'"
                  [class.hover:bg-gray-100]="activeTab !== 'listings'"
                  (click)="setTab('listings')"
                >
                  E'lonlar
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg font-medium transition"
                  [class.bg-brand]="activeTab === 'buyers'"
                  [class.text-white]="activeTab === 'buyers'"
                  [class.text-dark]="activeTab !== 'buyers'"
                  [class.hover:bg-gray-100]="activeTab !== 'buyers'"
                  (click)="setTab('buyers')"
                >
                  Xaridor
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg font-medium transition"
                  [class.bg-brand]="activeTab === 'favorites'"
                  [class.text-white]="activeTab === 'favorites'"
                  [class.text-dark]="activeTab !== 'favorites'"
                  [class.hover:bg-gray-100]="activeTab !== 'favorites'"
                  (click)="setTab('favorites')"
                >
                  Tanlanganlar
                </button>
              </div>

              <div class="p-4 sm:p-6">
                <div *ngIf="editing" class="mb-4">
                  <app-profile-edit
                    [user]="user"
                    [saving]="savingProfile"
                    (saved)="onProfileSaved($event)"
                    (cancelled)="editing = false"
                  >
                  </app-profile-edit>
                </div>

                <div *ngIf="!editing && activeTab === 'listings'" class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-dark">Mening e'lonlarim</h3>
                    <a
                      routerLink="/properties/create"
                      class="px-3 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:opacity-90 transition"
                      >Yangi e'lon</a
                    >
                  </div>

                  <div
                    class="rounded-xl bg-gray-50 border border-gray-100 p-8 text-center text-gray-500"
                  >
                    <p class="m-0">E'lonlar ro'yxati bu yerda chiqadi.</p>
                    <a
                      routerLink="/properties/create"
                      class="inline-block mt-4 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:opacity-90 transition"
                      >Yangi e'lon qo'shish</a
                    >
                  </div>
                </div>

                <div
                  *ngIf="!editing && activeTab === 'buyers'"
                  class="rounded-xl bg-gray-50 border border-gray-100 p-8 text-center text-gray-500"
                >
                  <p class="m-0">Xaridorlar bo'limi tez orada to'ldiriladi.</p>
                  <a
                    routerLink="/chat"
                    class="inline-block mt-4 px-4 py-2 rounded-lg border border-gray-300 text-dark text-sm font-semibold hover:bg-white transition"
                    >Xabarlarga o'tish</a
                  >
                </div>

                <div
                  *ngIf="!editing && activeTab === 'favorites'"
                  class="rounded-xl bg-gray-50 border border-gray-100 p-8 text-center text-gray-500"
                >
                  <p class="m-0">Tanlangan mulklar bo'limi.</p>
                  <a
                    routerLink="/favorites"
                    class="inline-block mt-4 px-4 py-2 rounded-lg border border-gray-300 text-dark text-sm font-semibold hover:bg-white transition"
                    >Tanlanganlarni ochish</a
                  >
                </div>
              </div>
            </div>
          </section>
        </div>

        <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mt-4">
          {{ error }}
        </div>
      </div>
    </div>
  `,
})
export class ProfilePageComponent implements OnInit {
  user?: UserResponse;
  loading = true;
  editing = false;
  savingProfile = false;
  uploadingAvatar = false;
  error = '';
  activeTab: 'listings' | 'buyers' | 'favorites' = 'listings';
  activeSidebar: 'profile' | 'balance' | 'settings' = 'profile';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.error = '';
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Failed to load profile.';
        this.loading = false;
      },
    });
  }

  onProfileSaved(dto: UserUpdateDto) {
    this.savingProfile = true;
    this.userService.updateProfile(dto).subscribe({
      next: (user) => {
        this.user = user;
        this.savingProfile = false;
        this.editing = false;
        // Ideal place for a success toast notification
      },
      error: (err) => {
        this.savingProfile = false;
        this.error = typeof err === 'string' ? err : 'Failed to save profile.';
      },
    });
  }

  onAvatarSelected(file: File) {
    this.uploadingAvatar = true;
    this.userService.uploadAvatar(file).subscribe({
      next: (user) => {
        this.user = user;
        this.uploadingAvatar = false;
      },
      error: (err) => {
        this.uploadingAvatar = false;
        this.error = typeof err === 'string' ? err : 'Failed to upload avatar.';
      },
    });
  }

  setTab(tab: 'listings' | 'buyers' | 'favorites'): void {
    this.activeTab = tab;
  }

  setSidebar(sidebar: 'profile' | 'balance' | 'settings'): void {
    this.activeSidebar = sidebar;
  }

  formatLanguage(lang?: string): string {
    if (lang === 'uz') return "O'zbekcha";
    if (lang === 'ru') return 'Русский';
    if (lang === 'en') return 'English';
    return lang || 'Not set';
  }
}
