import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Property } from '../../core/models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="favorites-container">
      <div class="container">
        <div class="page-header">
          <h1>Sevimlilar</h1>
          <p>Saqlangan mulklaringiz</p>
        </div>

        @if (loading()) {
          <div class="loading-container">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Yuklanmoqda...</p>
          </div>
        } @else if (favorites().length === 0) {
          <div class="empty-container">
            <mat-icon>favorite_border</mat-icon>
            <h3>Sevimlilar bo'sh</h3>
            <p>Siz hali hech qanday mulkni sevimlilarga qo'shmagansiz</p>
            <button mat-raised-button color="primary" routerLink="/properties">
              Mulk qidirish
            </button>
          </div>
        } @else {
          <div class="favorites-grid">
            @for (property of favorites(); track property.id) {
              <mat-card class="property-card">
                <div class="property-image" [routerLink]="['/properties', property.id]">
                  @if (property.images && property.images.length > 0) {
                    <img [src]="property.images[0].imageUrl" [alt]="property.title">
                  } @else {
                    <div class="no-image">
                      <mat-icon>image_not_supported</mat-icon>
                    </div>
                  }
                  <button 
                    mat-icon-button 
                    class="favorite-btn active"
                    (click)="removeFavorite(property.id); $event.stopPropagation()"
                    matTooltip="Sevimlilardan olib tashlash">
                    <mat-icon>favorite</mat-icon>
                  </button>
                </div>

                <mat-card-content>
                  <div class="property-header">
                    <h3 [routerLink]="['/properties', property.id]">{{ property.title }}</h3>
                    <div class="rating" *ngIf="property.averageRating > 0">
                      <mat-icon>star</mat-icon>
                      <span>{{ property.averageRating | number:'1.1-1' }}</span>
                    </div>
                  </div>

                  <p class="location">
                    <mat-icon>location_on</mat-icon>
                    {{ property.city }}, {{ property.district }}
                  </p>

                  <div class="property-details">
                    <span>
                      <mat-icon>bed</mat-icon>
                      {{ property.numberOfBedrooms }} xona
                    </span>
                    <span>
                      <mat-icon>square_foot</mat-icon>
                      {{ property.area }} m²
                    </span>
                  </div>

                  <div class="price-section">
                    <span class="price">{{ property.salePrice || property.monthlyRent || property.pricePerNight | number }} {{ property.currency }}</span>
                    <span class="type">{{ getListingTypeLabel(property.listingType) }}</span>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .favorites-container {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
      padding: 40px 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .page-header p {
      color: #666;
    }

    .loading-container,
    .empty-container {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .property-card {
      overflow: hidden;
    }

    .property-image {
      position: relative;
      height: 200px;
      cursor: pointer;
    }

    .property-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0e0e0;
    }

    .no-image mat-icon {
      font-size: 48px;
      color: #999;
    }

    .favorite-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: white !important;
      color: #f44336 !important;
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .property-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      cursor: pointer;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffa500;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .property-details {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
    }

    .property-details span {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #666;
    }

    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #eee;
    }

    .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #667eea;
    }

    .type {
      font-size: 0.8rem;
      color: #666;
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .favorites-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FavoritesComponent implements OnInit {
  private snackBar = inject(MatSnackBar);

  favorites = signal<Property[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    // Simulate loading - would be replaced with actual API call
    setTimeout(() => {
      this.loading.set(false);
      this.favorites.set([]); // Empty for now, would be populated from API
    }, 1000);
  }

  removeFavorite(id: string): void {
    this.favorites.update(favs => favs.filter(p => p.id !== id));
    this.snackBar.open('Sevimlilardan olib tashlandi', 'Yopish', { duration: 2000 });
  }

  getListingTypeLabel(type: string): string {
    switch (type) {
      case 'Sale': return 'Sotuv';
      case 'Rent': return 'Ijaraga';
      case 'ShortTermRent': return 'Qisqa muddatli';
      default: return type;
    }
  }
}
