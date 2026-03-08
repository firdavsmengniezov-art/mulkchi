import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Property } from '../../../core/models/property.models';

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
            <span class="price-period" *ngIf="property.listingType === 'Rent'">/oy</span>
            <span class="price-period" *ngIf="property.listingType === 'ShortTermRent'">/kecha</span>
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
  isFavorite = false;

  getBadgeClass(): string {
    switch (this.property.listingType) {
      case 'Rent': return 'badge-rent';
      case 'Sale': return 'badge-sale';
      case 'ShortTermRent': return 'badge-short';
      default: return 'badge-rent';
    }
  }

  getBadgeLabel(): string {
    switch (this.property.listingType) {
      case 'Rent': return 'IJARA';
      case 'Sale': return 'SOTUVDA';
      case 'ShortTermRent': return 'QISQA MUDDAT';
      default: return 'IJARA';
    }
  }

  getPrice(): number {
    if (this.property.listingType === 'Sale') return this.property.salePrice ?? 0;
    if (this.property.listingType === 'ShortTermRent') return this.property.pricePerNight ?? 0;
    return this.property.monthlyRent ?? 0;
  }

  getRegionLabel(region: string): string {
    const labels: Record<string, string> = {
      ToshkentShahar: 'Toshkent sh.',
      ToshkentViloyat: 'Toshkent vil.',
      Samarqand: 'Samarqand',
      Buxoro: 'Buxoro',
      Andijon: 'Andijon',
      Fargona: 'Fargʻona',
      Namangan: 'Namangan',
      Qashqadaryo: 'Qashqadaryo',
      Surxondaryo: 'Surxondaryo',
      Xorazm: 'Xorazm',
      Navoiy: 'Navoiy',
      Jizzax: 'Jizzax',
      Sirdaryo: 'Sirdaryo',
      Qoraqalpogiston: 'Qoraqalpogʻiston'
    };
    return labels[region] ?? region;
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
  }
}
