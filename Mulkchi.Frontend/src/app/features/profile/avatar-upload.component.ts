import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block group">
      <div
        class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center"
      >
        <img
          *ngIf="avatarUrl"
          [src]="apiUrl + avatarUrl"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
        <span *ngIf="!avatarUrl" class="text-gray-400 text-4xl">
          <i class="fas fa-user"></i>
        </span>
      </div>

      <!-- Overlay -->
      <label
        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity"
      >
        <div class="text-center">
          <i class="fas fa-camera mb-1"></i>
          <span class="block text-xs font-semibold">Change</span>
        </div>
        <input
          type="file"
          class="hidden"
          accept="image/*"
          (change)="onFileSelected($event)"
          [disabled]="isUploading"
        />
      </label>

      <!-- Loading spinner -->
      <div
        *ngIf="isUploading"
        class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    </div>
  `,
})
export class AvatarUploadComponent {
  @Input() avatarUrl?: string | null;
  @Input() isUploading = false;
  @Output() fileSelected = new EventEmitter<File>();

  // Add environment based url resolution for images
  apiUrl = 'http://localhost:5000'; // Replace with environment

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.match(/image\/*/)) {
        this.fileSelected.emit(file);
      } else {
        alert('Please select an image file (JPG, PNG, WEBP).');
      }
    }
  }
}
