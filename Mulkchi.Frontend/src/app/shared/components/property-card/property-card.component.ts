import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Property } from '../../../core/models';
import { FavoriteService } from '../../../core/services/favorite.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss'
})
export class PropertyCardComponent {
  @Input() property!: Property;
  router = inject(Router);
  favoriteService = inject(FavoriteService);
  isFavorite = false;

  constructor() {
    // Check if property is in favorites
    this.favoriteService.isFavorited(this.property?.id || '').subscribe(favorited => {
      this.isFavorite = favorited;
    });
  }

  navigateToProperty(): void {
    this.router.navigate(['/properties', this.property.id]);
  }

  getPrice(): string {
    if (this.property.listingType === 'Rent') {
      return `$${this.property.monthlyRent}/oy`;
    }
    if (this.property.listingType === 'DailyRent') {
      return `$${this.property.pricePerNight}/kun`;
    }
    return `$${this.property.salePrice?.toLocaleString()}`;
  }

  getImage(): string {
    if (this.property.images?.length) {
      return this.property.images[0].url;
    }
    // Unsplash placeholder by property type
    const photos: any = {
      Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      House: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      Office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      Land: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      Commercial: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
    };
    return photos[this.property.type] || photos.Apartment;
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400';
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    if (this.isFavorite) {
      this.favoriteService.removeFavorite(this.property.id);
    } else {
      this.favoriteService.addFavorite(this.property.id);
    }
  }
}
