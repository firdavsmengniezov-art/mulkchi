import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PropertyImageService } from '../../../core/services/property-image.service';
import { PropertyImage, PropertyImageUploadRequest } from '../../../core/models/property-image.model';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  @Input() propertyId: string | null = null;
  @Input() existingImages: PropertyImage[] = [];
  @Input() maxFiles: number = 10;
  @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB
  @Input() acceptedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'];
  
  @Output() imagesUploaded = new EventEmitter<PropertyImage[]>();
  @Output() imageDeleted = new EventEmitter<string>();
  @Output() primaryImageSet = new EventEmitter<string>();

  selectedFiles: File[] = [];
  imagePreviews: { file: File; preview: string; progress: number; id: string }[] = [];
  uploadProgress: { [key: string]: number } = {};
  isUploading = false;
  dragOver = false;

  constructor(private propertyImageService: PropertyImageService,
    private logger: LoggingService) {}

  ngOnInit(): void {
    // Initialize with existing images
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFileSelection(files);
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    this.handleFileSelection(files);
  }

  private handleFileSelection(files: File[]): void {
    const validFiles = files.filter(file => this.validateFile(file));
    
    if (validFiles.length === 0) {
      return;
    }

    if (this.selectedFiles.length + validFiles.length > this.maxFiles) {
      alert(`Maximum ${this.maxFiles} files allowed`);
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      const fileId = Math.random().toString(36).substr(2, 9);
      
      reader.onload = (e) => {
        this.imagePreviews.push({
          file,
          preview: e.target?.result as string,
          progress: 0,
          id: fileId
        });
      };
      
      reader.readAsDataURL(file);
      this.selectedFiles.push(file);
    });
  }

  private validateFile(file: File): boolean {
    if (!this.acceptedTypes.includes(file.type)) {
      alert(`Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.`);
      return false;
    }
    
    if (file.size > this.maxFileSize) {
      alert(`File too large: ${file.name}. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB.`);
      return false;
    }
    
    return true;
  }

  removeSelectedFile(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  uploadImages(): void {
    if (!this.propertyId) {
      alert('Please save the property first before uploading images');
      return;
    }

    if (this.selectedFiles.length === 0) {
      alert('No files selected');
      return;
    }

    this.isUploading = true;

    const uploadRequest: PropertyImageUploadRequest = {
      propertyId: this.propertyId,
      files: this.selectedFiles
    };

    this.propertyImageService.uploadPropertyImages(uploadRequest).subscribe({
      next: (response) => {
        if (response.images) {
          this.imagesUploaded.emit(response.images);
          this.selectedFiles = [];
          this.imagePreviews = [];
        }
      },
      error: (error) => {
        this.logger.error('Upload error:', error);
        alert(`Upload failed: ${error}`);
        this.isUploading = false;
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  deleteImage(imageId: string): void {
    if (confirm('Are you sure you want to delete this image?')) {
      this.propertyImageService.deletePropertyImage(imageId).subscribe({
        next: () => {
          this.imageDeleted.emit(imageId);
        },
        error: (error) => {
          this.logger.error('Delete error:', error);
          alert(`Delete failed: ${error}`);
        }
      });
    }
  }

  setPrimaryImage(imageId: string): void {
    this.propertyImageService.setPrimaryImage(imageId).subscribe({
      next: (updatedImage) => {
        this.primaryImageSet.emit(imageId);
        // Update the existing images array
        const index = this.existingImages.findIndex(img => img.id === imageId);
        if (index !== -1) {
          this.existingImages[index] = updatedImage;
        }
      },
      error: (error) => {
        this.logger.error('Set primary error:', error);
        alert(`Failed to set primary image: ${error}`);
      }
    });
  }

  get totalFiles(): number {
    return this.existingImages.length + this.selectedFiles.length;
  }

  get canUploadMore(): boolean {
    return this.totalFiles < this.maxFiles;
  }
}
