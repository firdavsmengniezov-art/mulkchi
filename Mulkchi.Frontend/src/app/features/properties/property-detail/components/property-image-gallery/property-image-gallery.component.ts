import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-property-image-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-image-gallery.component.html',
  styleUrls: ['./property-image-gallery.component.scss'],
})
export class PropertyImageGalleryComponent {
  @Input() images: string[] = [];

  get displayImages() {
    return this.images?.length ? this.images : ['/assets/images/property-placeholder.jpg'];
  }

  get mainImage() {
    return this.displayImages[0];
  }

  get gridImages() {
    return this.displayImages.slice(1, 5);
  }

  lightboxOpen = false;
  currentIndex = 0;

  openLightbox(index: number) {
    this.currentIndex = index;
    this.lightboxOpen = true;
    document.addEventListener('keydown', this.handleKeydown);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxOpen = false;
    document.removeEventListener('keydown', this.handleKeydown);
    document.body.style.overflow = 'auto';
  }

  nextImage(e?: Event) {
    if (e) {
      e.stopPropagation();
    }
    this.currentIndex = (this.currentIndex + 1) % this.displayImages.length;
  }

  prevImage(e?: Event) {
    if (e) {
      e.stopPropagation();
    }
    this.currentIndex =
      (this.currentIndex - 1 + this.displayImages.length) % this.displayImages.length;
  }

  handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowRight') this.nextImage();
    if (e.key === 'ArrowLeft') this.prevImage();
  };
}
