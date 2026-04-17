import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Property } from '../../../../core/models/property.model';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyCardComponent {
  @Input() property!: Property;
  @Output() favoriteToggled = new EventEmitter<string>();

  currentImageIndex = 0;
  isFavorited = false;

  get images(): string[] {
    if (!this.property.images?.length) {
      return ['/assets/images/property-placeholder.jpg'];
    }
    return this.property.images
      .map((image) => image.url || image.imageUrl)
      .filter((url): url is string => typeof url === 'string' && url.length > 0);
  }

  nextImage(e: Event) {
    e.stopPropagation();
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  prevImage(e: Event) {
    e.stopPropagation();
    this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  toggleFavorite(e: Event) {
    e.stopPropagation();
    this.isFavorited = !this.isFavorited; // optimistic
    this.favoriteToggled.emit(this.property.id);
  }

  get displayPrice(): string {
    const price =
      this.property.monthlyRent ?? this.property.salePrice ?? this.property.pricePerNight;
    if (!price) return 'Narx kelishiladi';
    return new Intl.NumberFormat('uz-UZ').format(Number(price)) + ' UZS';
  }

  get priceSuffix(): string {
    if (this.property.monthlyRent) return '/oy';
    if (this.property.pricePerNight) return '/kecha';
    return '';
  }
}
