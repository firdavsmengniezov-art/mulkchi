import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserResponse, UserUpdateDto } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { AvatarUploadComponent } from './avatar-upload.component';
import { ProfileEditComponent } from './profile-edit.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, AvatarUploadComponent, ProfileEditComponent],
  template: `
    <div class="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div *ngIf="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="!loading && user" class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Header Profile Header Info -->
        <div
          class="px-4 py-5 sm:px-6 flex flex-col md:flex-row items-center border-b border-gray-200"
        >
          <div class="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <app-avatar-upload
              [avatarUrl]="user.avatarUrl"
              [isUploading]="uploadingAvatar"
              (fileSelected)="onAvatarSelected($event)"
            >
            </app-avatar-upload>
          </div>

          <div class="text-center md:text-left flex-1">
            <h3 class="text-2xl leading-6 font-bold text-gray-900">
              {{ user.firstName }} {{ user.lastName }}
              <span
                *ngIf="user.isVerified"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2"
              >
                <svg
                  class="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 8 8"
                >
                  <circle cx="4" cy="4" r="3" />
                </svg>
                Verified
              </span>
            </h3>

            <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ user.email }} | {{ user.role }}</p>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Member since: {{ user.createdDate | date: 'longDate' }}
            </p>
          </div>

          <div class="mt-4 md:mt-0 flex-shrink-0">
            <button
              *ngIf="!editing"
              (click)="editing = true"
              class="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <!-- Editable Form Section -->
        <div *ngIf="editing" class="p-6 bg-gray-50 border-b border-gray-200">
          <app-profile-edit
            [user]="user"
            [saving]="savingProfile"
            (saved)="onProfileSaved($event)"
            (cancelled)="editing = false"
          >
          </app-profile-edit>
        </div>

        <!-- Bio & Details (Read Only) -->
        <div *ngIf="!editing" class="px-4 py-5 sm:p-6 text-gray-700">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4">
            <div class="sm:col-span-1">
              <dt class="text-sm font-medium text-gray-500">Phone number</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ user.phoneNumber || 'Not provided' }}</dd>
            </div>

            <div class="sm:col-span-1">
              <dt class="text-sm font-medium text-gray-500">Preferred Language</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatLanguage(user.preferredLanguage) }}
              </dd>
            </div>

            <div class="sm:col-span-2 mt-4">
              <dt class="text-sm font-medium text-gray-500">Bio</dt>
              <dd class="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {{ user.bio || 'No bio provided yet.' }}
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mt-4">
        {{ error }}
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

  formatLanguage(lang?: string): string {
    if (lang === 'uz') return "O'zbekcha";
    if (lang === 'ru') return 'Русский';
    if (lang === 'en') return 'English';
    return lang || 'Not set';
  }
}
