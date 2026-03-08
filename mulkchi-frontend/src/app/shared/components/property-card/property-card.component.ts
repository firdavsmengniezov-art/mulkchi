import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Property, ListingType, UzbekistanRegion } from '../../../core/models/property.models';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="property-card" [routerLink]="['/properties', property.id]">
      <div class="card-image">
        <div class="image-gradient">
          <span class="property-emoji">🏠</span>
        </div>
        <span class="badge" [ngClass]="getBadgeClass()">{{ getBadgeLabel() }}</span>
        <button class="favorite-btn" (click)="toggleFavorite($event)">
          {{ isFavorite ? '❤️' : '🤍' }}
        </button>
        <div *ngIf="property.isVerified" class="verified-badge">✓ Tasdiqlangan</div>
      </div>

      <div class="card-body">
        <h3 class="card-title">{{ property.title }}</h3>
        <p class="card-location">📍 {{ property.city }}, {{ getRegionLabel(property.region) }}</p>

        <div class="card-meta">
          <span>🛏 {{ property.numberOfBedrooms }} xona</span>
          <span>🚿 {{ property.numberOfBathrooms }} hammom</span>
          <span>📐 {{ property.area }} m²</span>
        </div>

        <div class="card-footer">
          <div class="price">
            <span class="price-amount">{{ getPrice() | number }}</span>
            <span class="price-currency"> UZS</span>
            <span class="price-period" *ngIf="property.listingType === ListingType.Rent">/oy</span>
            <span class="price-period" *ngIf="property.listingType === ListingType.ShortTermRent">/kecha</span>
          </div>
          <div class="rating" *ngIf="property.averageRating > 0">
            ⭐ {{ property.averageRating | number:'1.1-1' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent {
  @Input() property!: Property;
  readonly ListingType = ListingType;
  isFavorite = false;

  getBadgeClass(): string {
    switch (this.property.listingType) {
      case ListingType.Rent: return 'badge-rent';
      case ListingType.Sale: return 'badge-sale';
      case ListingType.ShortTermRent: return 'badge-short';
      default: return 'badge-rent';
    }
  }

  getBadgeLabel(): string {
    switch (this.property.listingType) {
      case ListingType.Rent: return 'IJARA';
      case ListingType.Sale: return 'SOTUVDA';
      case ListingType.ShortTermRent: return 'QISQA MUDDAT';
      default: return 'IJARA';
    }
  }

  getPrice(): number {
    if (this.property.listingType === ListingType.Sale) return this.property.salePrice ?? 0;
    if (this.property.listingType === ListingType.ShortTermRent) return this.property.pricePerNight ?? 0;
    return this.property.monthlyRent ?? 0;
  }

  getRegionLabel(region: UzbekistanRegion): string {
    const labels: Record<number, string> = {
      [UzbekistanRegion.ToshkentShahar]: 'Toshkent sh.',
      [UzbekistanRegion.ToshkentViloyat]: 'Toshkent vil.',
      [UzbekistanRegion.Samarqand]: 'Samarqand',
      [UzbekistanRegion.Buxoro]: 'Buxoro',
      [UzbekistanRegion.Andijon]: 'Andijon',
      [UzbekistanRegion.Fargona]: 'Farg\'ona',
      [UzbekistanRegion.Namangan]: 'Namangan',
      [UzbekistanRegion.Qashqadaryo]: 'Qashqadaryo',
      [UzbekistanRegion.Surxondaryo]: 'Surxondaryo',
      [UzbekistanRegion.Xorazm]: 'Xorazm',
      [UzbekistanRegion.Navoiy]: 'Navoiy',
      [UzbekistanRegion.Jizzax]: 'Jizzax',
      [UzbekistanRegion.Sirdaryo]: 'Sirdaryo',
      [UzbekistanRegion.Qoraqalpogiston]: 'Qoraqalpog\'iston',
    };
    return labels[region] ?? String(region);
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
  }
}
