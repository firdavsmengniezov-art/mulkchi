import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PropertyService } from '../../core/services/property.service';
import { Property, ListingType } from '../../core/models';

@Component({
  selector: 'app-home',
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
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>O'zbekistondagi eng yaxshi ko'chmas mulk e'lonlari</h1>
          <p>Sotish, ijaraga olish yoki qisqa muddatli ijara uchun mukammal uyingizni toping</p>
          <div class="hero-actions">
            <button mat-raised-button color="primary" routerLink="/properties">
              <mat-icon>search</mat-icon>
              Mulk qidirish
            </button>
            <button mat-stroked-button color="primary" routerLink="/auth/register">
              Ro'yxatdan o'tish
            </button>
          </div>
        </div>
      </section>

      <!-- Featured Properties Section -->
      <section class="featured-section">
        <div class="container">
          <h2>Tavsiya etilgan mulklar</h2>
          
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Yuklanmoqda...</p>
            </div>
          } @else if (error()) {
            <div class="error-message">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error() }}</p>
              <button mat-raised-button color="primary" (click)="loadFeaturedProperties()">
                Qayta yuklash
              </button>
            </div>
          } @else if (featuredProperties().length === 0) {
            <div class="empty-message">
              <mat-icon>home</mat-icon>
              <p>Hozircha tavsiya etilgan mulklar yo'q</p>
            </div>
          } @else {
            <div class="properties-grid">
              @for (property of featuredProperties(); track property.id) {
                <mat-card class="property-card" [routerLink]="['/properties', property.id]">
                  <div class="property-image">
                    @if (property.images && property.images.length > 0) {
                      <img [src]="property.images[0].imageUrl" [alt]="property.title">
                    } @else {
                      <div class="no-image">
                        <mat-icon>image_not_supported</mat-icon>
                      </div>
                    }
                    <div class="property-badge" [class.featured]="property.isFeatured">
                      @if (property.isFeatured) {
                        <span>Featured</span>
                      }
                    </div>
                  </div>
                  
                  <mat-card-content>
                    <div class="property-header">
                      <h3>{{ property.title }}</h3>
                      <div class="property-rating" *ngIf="property.averageRating > 0">
                        <mat-icon>star</mat-icon>
                        <span>{{ property.averageRating | number:'1.1-1' }}</span>
                      </div>
                    </div>
                    
                    <p class="property-location">
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
                    
                    <div class="property-price">
                      @if (property.listingType === ListingType.Sale && property.salePrice) {
                        <span class="price">{{ property.salePrice | number }} {{ property.currency }}</span>
                        <span class="type">Sotuv</span>
                      } @else if (property.listingType === ListingType.Rent && property.monthlyRent) {
                        <span class="price">{{ property.monthlyRent | number }} {{ property.currency }}/oy</span>
                        <span class="type">Ijaraga</span>
                      } @else if (property.listingType === ListingType.ShortTermRent && property.pricePerNight) {
                        <span class="price">{{ property.pricePerNight | number }} {{ property.currency }}/tun</span>
                        <span class="type">Qisqa muddatli</span>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
            
            <div class="view-all">
              <button mat-raised-button color="primary" routerLink="/properties">
                Barcha mulklarni ko'rish
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          }
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item">
              <mat-icon>home</mat-icon>
              <h3>10,000+</h3>
              <p>Faol e'lonlar</p>
            </div>
            <div class="stat-item">
              <mat-icon>people</mat-icon>
              <h3>50,000+</h3>
              <p>Foydalanuvchilar</p>
            </div>
            <div class="stat-item">
              <mat-icon>verified</mat-icon>
              <h3>1,000+</h3>
              <p>Tasdiqlangan hostlar</p>
            </div>
            <div class="stat-item">
              <mat-icon>location_city</mat-icon>
              <h3>15</h3>
              <p>Viloyatlar</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
    }

    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 100px 20px;
      text-align: center;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.2;
    }

    .hero p {
      font-size: 1.25rem;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .featured-section {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .featured-section h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 40px;
      color: #333;
    }

    .loading-container,
    .error-message,
    .empty-message {
      text-align: center;
      padding: 60px 20px;
    }

    .error-message mat-icon,
    .empty-message mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .properties-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .property-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .property-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .property-image {
      position: relative;
      height: 200px;
      overflow: hidden;
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

    .property-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .property-badge.featured {
      background: #ff6b6b;
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
      flex: 1;
      line-height: 1.3;
    }

    .property-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffa500;
      font-weight: 500;
    }

    .property-rating mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .property-location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .property-location mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #999;
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

    .property-details mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .property-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #eee;
    }

    .property-price .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #667eea;
    }

    .property-price .type {
      font-size: 0.8rem;
      color: #666;
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .view-all {
      text-align: center;
      margin-top: 40px;
    }

    .stats-section {
      padding: 80px 0;
      background: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 40px;
      text-align: center;
    }

    .stat-item mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 16px;
    }

    .stat-item h3 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin: 0 0 8px 0;
    }

    .stat-item p {
      color: #666;
      font-size: 1rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }

      .hero p {
        font-size: 1rem;
      }

      .properties-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private propertyService = inject(PropertyService);

  featuredProperties = this.propertyService.featuredProperties;
  loading = this.propertyService.loading;
  error = signal<string | null>(null);
  ListingType = ListingType;

  ngOnInit(): void {
    this.loadFeaturedProperties();
  }

  loadFeaturedProperties(): void {
    this.error.set(null);
    
    this.propertyService.getFeaturedProperties(6).subscribe({
      error: (err) => {
        this.error.set('Mulklarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
        console.error('Error loading featured properties:', err);
      }
    });
  }
}
