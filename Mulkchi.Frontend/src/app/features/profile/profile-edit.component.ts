import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserResponse, UserUpdateDto } from '../../core/models/user.model';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form
      (submit)="onSubmit()"
      class="bg-white rounded-lg shadow p-6 max-w-lg mb-8 mx-auto space-y-4"
    >
      <h2 class="text-xl font-bold mb-4">Edit Profile</h2>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            [(ngModel)]="dto.firstName"
            name="firstName"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            [(ngModel)]="dto.lastName"
            name="lastName"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="text"
          [(ngModel)]="dto.phoneNumber"
          name="phoneNumber"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Preferred Language</label>
        <select
          [(ngModel)]="dto.preferredLanguage"
          name="preferredLanguage"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
          <option value="uz">O'zbekcha</option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          [(ngModel)]="dto.bio"
          name="bio"
          rows="4"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        ></textarea>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          (click)="onCancel()"
          class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="saving"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <span *ngIf="saving">Saving...</span>
          <span *ngIf="!saving">Save</span>
        </button>
      </div>
    </form>
  `,
})
export class ProfileEditComponent {
  @Input() set user(val: UserResponse) {
    this.dto = {
      firstName: val.firstName,
      lastName: val.lastName,
      phoneNumber: val.phoneNumber,
      bio: val.bio,
      preferredLanguage: val.preferredLanguage,
    };
  }
  @Input() saving = false;

  @Output() saved = new EventEmitter<UserUpdateDto>();
  @Output() cancelled = new EventEmitter<void>();

  dto: UserUpdateDto = { firstName: '', lastName: '' };

  onSubmit() {
    this.saved.emit(this.dto);
  }

  onCancel() {
    this.cancelled.emit();
  }
}
