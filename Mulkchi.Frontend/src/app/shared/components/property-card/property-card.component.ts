import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { Property } from '../../../core/models';
import { FavoriteService } from '../../../core/services/favorite.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss',
})
export class PropertyCardComponent implements OnChanges {
  @Input() property!: Property;
  router = inject(Router);
  favoriteService = inject(FavoriteService);
  isFavorite = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property']?.currentValue?.id) {
      // Signal-based API - isFavorited returns boolean directly
      this.isFavorite = this.favoriteService.isFavorited(this.property.id);
    }
  }

  navigateToProperty(): void {
    this.router.navigate(['/properties', this.property.id]);
  }

  getPrice(): string {
    const amount =
      this.property.monthlyRent ?? this.property.salePrice ?? this.property.pricePerNight;

    if (!amount) {
      return 'Narx kelishiladi';
    }

    const formatted = new Intl.NumberFormat('uz-UZ').format(Number(amount));
    return `${formatted} UZS`;
  }

  getPriceSuffix(): string {
    if (this.property.listingType === 'Rent' && this.property.monthlyRent) return '/oy';
    if (this.property.listingType === 'DailyRent' && this.property.pricePerNight) return '/kun';
    return '';
  }

  getImage(): string {
    if (this.property.images?.length && this.property.images[0].url) {
      return this.property.images[0].url;
    }
    // Unsplash placeholder by property type
    const photos: Record<string, string> = {
      Apartment: '/assets/images/placeholder-property.svg',
      House: '/assets/images/placeholder-property.svg',
      Office: '/assets/images/placeholder-property.svg',
      Land: '/assets/images/placeholder-property.svg',
      Commercial: '/assets/images/placeholder-property.svg',
    };
    return photos[this.property.type] || photos['Apartment'];
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/placeholder-property.svg';
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    if (this.isFavorite) {
      this.favoriteService
        .removeFavorite(this.property.id)
        .pipe(take(1))
        .subscribe(() => {
          this.isFavorite = false;
        });
    } else {
      this.favoriteService
        .addFavorite(this.property.id)
        .pipe(take(1))
        .subscribe(() => {
          this.isFavorite = true;
        });
    }
  }
}
