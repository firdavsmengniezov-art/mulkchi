import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Property } from '../../../core/models';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, FavoriteButtonComponent],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss'
})
export class PropertyCardComponent {
  @Input() property!: Property;
  router = inject(Router);

  getPrice(): string {
    if (this.property.listingType === 'Rent') return `$${this.property.monthlyRent}/oy`;
    if (this.property.listingType === 'DailyRent') return `$${this.property.pricePerNight}/kun`;
    return `$${this.property.salePrice?.toLocaleString()}`;
  }

  getImage(): string {
    if (this.property.images?.length) return this.property.images[0].url;
    // Unsplash placeholder by property type
    const photos: any = {
      Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      House: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
      Office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      default: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'
    };
    return photos[this.property.type] || photos.default;
  }

  getBadgeClass(): string {
    return this.property.listingType === 'Rent' ? 'badge-rent' :
           this.property.listingType === 'Sale' ? 'badge-sale' : 'badge-daily';
  }

  getBadgeText(): string {
    return this.property.listingType === 'Rent' ? 'Ijara' :
           this.property.listingType === 'Sale' ? 'Sotiladi' : 'Kunlik';
  }
}
