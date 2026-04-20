import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PropertyService } from '../../core/services/property.service';
import { Property, ListingType } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero" 
               style="background-image: url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80');
                      background-size: cover; background-position: center;">
        <!-- Overlay -->
        <div style="background: linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(79,70,229,0.6) 100%); 
                     position:absolute; inset:0;"></div>
        
        <div class="hero-content">
          <h1>
            O'zbekistonda <span style="color:#D4A017">eng qulay</span>
            <br>ko'chmas mulk platformasi
          </h1>
          <p class="hero-subtitle">Sotish, ijara, kunlik — hammasi bir joyda</p>

          <!-- Listing Type Toggle -->
          <div class="listing-type-toggle">
            <button 
              [class.active]="listingType === 'Sale'" 
              (click)="listingType = 'Sale'"
              class="toggle-btn">
              Sotib olish
            </button>
            <button 
              [class.active]="listingType === 'Rent'" 
              (click)="listingType = 'Rent'"
              class="toggle-btn">
              Ijaraga olish
            </button>
            <button 
              [class.active]="listingType === 'ShortTermRent'" 
              (click)="listingType = 'ShortTermRent'"
              class="toggle-btn">
              Kunlik ijara
            </button>
          </div>

          <!-- Search Input -->
          <div class="hero-search">
            <mat-form-field appearance="outline" class="search-field">
              <mat-icon matPrefix>location_on</mat-icon>
              <input matInput
                     [(ngModel)]="searchQuery"
                     placeholder="Shahar, tuman yoki ko'cha..."
                     (keyup.enter)="onSearch()">
            </mat-form-field>
            <button mat-raised-button color="accent" class="search-btn" (click)="onSearch()">
              <mat-icon>search</mat-icon>
              Qidirish
            </button>
          </div>

          <div class="hero-actions">
            <button mat-stroked-button class="btn-white" routerLink="/auth/register">
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
              <mat-progress-spinner diameter="50"></mat-progress-spinner>
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
                <mat-card class="property-card" (click)="navigateToProperty(property.id)">
                  <div class="property-image">
                    @if (property.images && property.images.length > 0) {
                      <img [src]="getImageUrl(property)" 
                           [attr.data-property-type]="property.type"
                           [alt]="property.title" 
                           (error)="onImgError($event)"
                           style="width:100%; height:220px; object-fit:cover;">
                    } @else {
                      <img [src]="getPlaceholderImage(property)" 
                           [alt]="property.title"
                           style="width:100%; height:220px; object-fit:cover;">
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
                    
                    <div class="property-price" 
                         [class.sale]="property.listingType === ListingType.Sale"
                         [class.rent]="property.listingType === ListingType.Rent"
                         [class.short-term]="property.listingType === ListingType.ShortTermRent">
                      @if (property.listingType === ListingType.Sale && property.salePrice) {
                        <span class="price">{{ property.salePrice | number }} {{ property.currency }}</span>
                        <span class="type sale-type">Sotuv</span>
                      } @else if (property.listingType === ListingType.Rent && property.monthlyRent) {
                        <span class="price">{{ property.monthlyRent | number }} {{ property.currency }}/oy</span>
                        <span class="type rent-type">Ijaraga</span>
                      } @else if (property.listingType === ListingType.ShortTermRent && property.pricePerNight) {
                        <span class="price">{{ property.pricePerNight | number }} {{ property.currency }}/tun</span>
                        <span class="type short-term-type">Qisqa muddatli</span>
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
              <h3>20,000+</h3>
              <p>E'lonlar</p>
            </div>
            <div class="stat-item">
              <mat-icon>location_city</mat-icon>
              <h3>14</h3>
              <p>Viloyat</p>
            </div>
            <div class="stat-item">
              <mat-icon>people</mat-icon>
              <h3>50,000+</h3>
              <p>Foydalanuvchilar</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Why Mulkchi Section -->
      <section class="why-section">
        <div class="container">
          <h2 class="section-title">Nima uchun Mulkchi?</h2>
          <div class="features-grid">
            <!-- AI Price Prediction -->
            <div class="feature-card">
              <div class="feature-icon ai">
                <mat-icon>psychology</mat-icon>
              </div>
              <h3>AI narx bashorati</h3>
              <p>Mulkchi sun'iy intellekt yordamida mulk narxi tahlil qiladi va eng yaxshi takliflarni tanlashga yordam beradi</p>
            </div>

            <!-- Secure Payment -->
            <div class="feature-card">
              <div class="feature-icon payment">
                <mat-icon>payments</mat-icon>
              </div>
              <h3>Xavfsiz to'lov</h3>
              <p>Payme va Click orqali xavfsiz to'lov amalga oshiring. Mablag'lar bron tasdiqlangunicha himoyalangan</p>
            </div>

            <!-- Real-time Chat -->
            <div class="feature-card">
              <div class="feature-icon chat">
                <mat-icon>chat</mat-icon>
              </div>
              <h3>Real-time chat</h3>
              <p>Egasidan to'g'ridan-to'g'ri chat orqali suhbatlashing. Barcha xabarlar real vaqt rejimida yetkaziladi</p>
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
      background: #0F172A;
      color: white;
      padding: 120px 20px 100px;
      text-align: center;
      position: relative;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.3) 0%, transparent 60%);
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .hero h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      margin-bottom: 40px;
      opacity: 0.8;
    }

    .hero-search {
      display: flex;
      gap: 12px;
      max-width: 600px;
      margin: 0 auto 24px;
      align-items: flex-start;
    }

    .search-field {
      flex: 1;
      background: white;
      border-radius: 12px;
      --mdc-filled-text-field-container-color: white;
    }

    .search-field ::ng-deep .mat-mdc-form-field-flex {
      align-items: center;
    }

    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      padding-left: 16px;
    }

    .search-field mat-icon {
      color: #667eea;
    }

    .search-btn {
      height: 56px;
      padding: 0 32px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-white {
      color: white;
      border-color: rgba(255,255,255,0.5);
    }

    /* Listing Type Toggle */
    .listing-type-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .toggle-btn {
      padding: 10px 24px;
      border: 2px solid rgba(255,255,255,0.3);
      background: transparent;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .toggle-btn:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
    }

    .toggle-btn.active {
      background: #D4A017;
      border-color: #D4A017;
      color: #0f172a;
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
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .property-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(212, 160, 23, 0.15);
      border-color: #D4A017;
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
      background: #D4A017;
      color: #000;
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
    }

    /* Price colors by listing type */
    :host ::ng-deep .property-card .property-price.sale .price {
      color: #D4A017 !important;
    }

    :host ::ng-deep .property-card .property-price.rent .price {
      color: #4ade80 !important;
    }

    :host ::ng-deep .property-card .property-price.short-term .price {
      color: #60a5fa !important;
    }

    .property-price .type {
      font-size: 0.8rem;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .property-price .type.sale-type {
      background: #1e3a5f;
      color: #93c5fd;
    }

    .property-price .type.rent-type {
      background: #166534;
      color: #86efac;
    }

    .property-price .type.short-term-type {
      background: #1e40af;
      color: #93c5fd;
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

    /* Why Mulkchi Section */
    .why-section {
      padding: 100px 0;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 60px;
      color: #0F172A;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }

    .feature-card {
      background: white;
      border-radius: 16px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    }

    .feature-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .feature-icon.ai {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .feature-icon.payment {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .feature-icon.chat {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .feature-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #0F172A;
    }

    .feature-card p {
      font-size: 1rem;
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }

      .hero p {
        font-size: 1rem;
      }

      .hero-search {
        flex-direction: column;
      }

      .search-btn {
        width: 100%;
        justify-content: center;
      }

      .properties-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .stat-item h3 {
        font-size: 1.5rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .section-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private router = inject(Router);

  featuredProperties = this.propertyService.featuredProperties;
  loading = this.propertyService.loading;
  error = signal<string | null>(null);
  ListingType = ListingType;

  searchQuery = '';
  listingType: 'Sale' | 'Rent' | 'ShortTermRent' = 'Rent';

  ngOnInit(): void {
    this.loadFeaturedProperties();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/properties'], {
        queryParams: { search: this.searchQuery.trim(), listingType: this.listingType }
      });
    } else {
      this.router.navigate(['/properties'], {
        queryParams: { listingType: this.listingType }
      });
    }
  }

  loadFeaturedProperties(): void {
    this.error.set(null);
    
    this.propertyService.getFeaturedProperties(6).subscribe({
      error: () => {
        this.error.set('Mulklarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
      }
    });
  }

  // Get image URL from property (handles multiple image formats)
  getImageUrl(property: any): string {
    if (property.images?.length > 0) {
      return property.images[0].url || property.images[0].imageUrl || '';
    }
    if (property.imageUrl) return property.imageUrl;
    if (property.thumbnailUrl) return property.thumbnailUrl;
    return this.getPlaceholderImage(property);
  }

  // Handle image load error
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const propertyType = img.getAttribute('data-property-type') || 'Apartment';
    img.src = this.getPlaceholderImage({ type: propertyType });
  }

  // Get placeholder image based on property type
  getPlaceholderImage(property: any): string {
    const type = property.type || 'Apartment';
    const colors: Record<string, string> = {
      'Apartment': '1a1a2e/D4A017',
      'House': '16213e/4ade80',
      'Villa': '0f3460/f59e0b',
      'Office': '1e293b/818cf8'
    };
    const color = colors[type] || '1a1a2e/D4A017';
    return `https://placehold.co/400x220/${color}?text=${encodeURIComponent(type)}`;
  }

  navigateToProperty(id: string): void {
    this.router.navigate(['/properties', id]);
  }
}
