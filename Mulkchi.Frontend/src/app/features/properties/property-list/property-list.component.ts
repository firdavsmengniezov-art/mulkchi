import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertyType, ListingType, PropertySearchParams } from '../../../core/models';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  template: `
    <div class="property-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="container">
          <h1>Ko'chmas mulk e'lonlari</h1>
          <p>O'zbekistondagi eng yaxshi mulk e'lonlarini qidirib toping</p>
        </div>
      </div>

      <div class="container main-content">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar">
          <mat-expansion-panel expanded>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>filter_list</mat-icon>
                Filterlar
              </mat-panel-title>
            </mat-expansion-panel-header>

            <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
              <!-- Location -->
              <div class="filter-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Joylashuv</mat-label>
                  <input matInput formControlName="location" placeholder="Shahar, tuman">
                  <mat-icon matPrefix>location_on</mat-icon>
                </mat-form-field>
              </div>

              <!-- Property Type -->
              <div class="filter-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Mulk turi</mat-label>
                  <mat-select formControlName="propertyType">
                    <mat-option value="">Barcha turlar</mat-option>
                    @for (type of propertyTypes; track type.value) {
                      <mat-option [value]="type.value">{{ type.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Listing Type -->
              <div class="filter-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>E'lon turi</mat-label>
                  <mat-select formControlName="listingType">
                    <mat-option value="">Barcha turlar</mat-option>
                    @for (type of listingTypes; track type.value) {
                      <mat-option [value]="type.value">{{ type.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Price Range -->
              <div class="filter-section">
                <label class="filter-label">Narx oralig'i</label>
                <div class="price-inputs">
                  <mat-form-field appearance="outline">
                    <mat-label>Min</mat-label>
                    <input matInput type="number" formControlName="minPrice">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Max</mat-label>
                    <input matInput type="number" formControlName="maxPrice">
                  </mat-form-field>
                </div>
              </div>

              <!-- Bedrooms -->
              <div class="filter-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Xonalar soni</mat-label>
                  <mat-select formControlName="bedrooms">
                    <mat-option value="">Barcha</mat-option>
                    @for (num of bedroomOptions; track num) {
                      <mat-option [value]="num">{{ num }}+</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Amenities -->
              <div class="filter-section">
                <label class="filter-label">Qulayliklar</label>
                <div class="amenities-chips">
                  @for (amenity of amenitiesList; track amenity.value) {
                    <mat-chip-option 
                      [selected]="isAmenitySelected(amenity.value)"
                      (selectionChange)="toggleAmenity(amenity.value)">
                      <mat-icon>{{ amenity.icon }}</mat-icon>
                      {{ amenity.label }}
                    </mat-chip-option>
                  }
                </div>
              </div>

              <button mat-raised-button color="primary" type="submit" class="full-width apply-btn">
                <mat-icon>search</mat-icon>
                Qidirish
              </button>

              <button mat-button type="button" class="full-width" (click)="resetFilters()">
                Filterlarni tozalash
              </button>
            </form>
          </mat-expansion-panel>
        </aside>

        <!-- Results Section -->
        <div class="results-section">
          <!-- Results Header -->
          <div class="results-header">
            <p class="results-count">
              @if (!loading()) {
                <strong>{{ totalCount() }}</strong> ta natija topildi
              }
            </p>
            <div class="view-toggle">
              <button mat-icon-button [color]="viewMode() === 'grid' ? 'primary' : ''" (click)="setViewMode('grid')">
                <mat-icon>grid_view</mat-icon>
              </button>
              <button mat-icon-button [color]="viewMode() === 'list' ? 'primary' : ''" (click)="setViewMode('list')">
                <mat-icon>view_list</mat-icon>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Yuklanmoqda...</p>
            </div>
          }

          <!-- Error State -->
          @if (error()) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error() }}</p>
              <button mat-raised-button color="primary" (click)="loadProperties()">Qayta yuklash</button>
            </div>
          }

          <!-- Empty State -->
          @if (!loading() && !error() && properties().length === 0) {
            <div class="empty-container">
              <mat-icon>search_off</mat-icon>
              <h3>Hech narsa topilmadi</h3>
              <p>Boshqa filterlardan foydalanib ko'ring</p>
            </div>
          }

          <!-- Properties Grid -->
          @if (!loading() && !error() && properties().length > 0) {
            <div class="properties-grid" [class.list-view]="viewMode() === 'list'">
              @for (property of properties(); track property.id) {
                <mat-card class="property-card" [routerLink]="['/properties', property.id]">
                  <div class="property-image">
                    @if (property.images && property.images.length > 0) {
                      <img [src]="property.images[0].imageUrl" [alt]="property.title">
                    } @else {
                      <div class="no-image">
                        <mat-icon>image_not_supported</mat-icon>
                      </div>
                    }
                    <div class="property-badges">
                      @if (property.isFeatured) {
                        <span class="badge featured">Featured</span>
                      }
                      @if (property.isVerified) {
                        <span class="badge verified">
                          <mat-icon>verified</mat-icon>
                        </span>
                      }
                      @if (property.isInstantBook) {
                        <span class="badge instant">Tez bron</span>
                      }
                    </div>
                  </div>

                  <mat-card-content>
                    <div class="property-header">
                      <h3>{{ property.title }}</h3>
                      <div class="rating" *ngIf="property.averageRating > 0">
                        <mat-icon>star</mat-icon>
                        <span>{{ property.averageRating | number:'1.1-1' }}</span>
                      </div>
                    </div>

                    <p class="location">
                      <mat-icon>location_on</mat-icon>
                      {{ property.city }}, {{ property.district }}
                    </p>

                    <div class="features">
                      <span>
                        <mat-icon>bed</mat-icon>
                        {{ property.numberOfBedrooms }}
                      </span>
                      <span>
                        <mat-icon>bathtub</mat-icon>
                        {{ property.numberOfBathrooms }}
                      </span>
                      <span>
                        <mat-icon>square_foot</mat-icon>
                        {{ property.area }}m²
                      </span>
                    </div>

                    <div class="amenities-preview">
                      @if (property.hasWifi) {
                        <mat-icon matTooltip="Wi-Fi">wifi</mat-icon>
                      }
                      @if (property.hasParking) {
                        <mat-icon matTooltip="Avtoturargoh">local_parking</mat-icon>
                      }
                      @if (property.hasAirConditioning) {
                        <mat-icon matTooltip="Konditsioner">ac_unit</mat-icon>
                      }
                    </div>

                    <div class="price-section">
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

            <!-- Pagination -->
            <mat-paginator
              [length]="totalCount()"
              [pageSize]="pageSize()"
              [pageIndex]="pageIndex()"
              [pageSizeOptions]="[12, 24, 48]"
              (page)="onPageChange($event)">
            </mat-paginator>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .property-list-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }

    .page-header h1 {
      font-size: 2.5rem;
      margin-bottom: 12px;
    }

    .page-header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .main-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      padding: 24px 20px;
    }

    .filters-sidebar {
      position: sticky;
      top: 24px;
      height: fit-content;
    }

    .filters-sidebar mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    .filter-section {
      margin-bottom: 20px;
    }

    .filter-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .price-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .amenities-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .apply-btn {
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .results-section {
      background: white;
      border-radius: 8px;
      padding: 24px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .results-count {
      margin: 0;
      color: #666;
    }

    .view-toggle {
      display: flex;
      gap: 8px;
    }

    .loading-container,
    .error-container,
    .empty-container {
      text-align: center;
      padding: 60px 20px;
    }

    .error-container mat-icon,
    .empty-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .properties-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .properties-grid.list-view {
      grid-template-columns: 1fr;
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

    .property-badges {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      display: flex;
      justify-content: space-between;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge.featured {
      background: #ff6b6b;
      color: white;
    }

    .badge.verified {
      background: white;
      color: #4caf50;
      padding: 4px;
      border-radius: 50%;
    }

    .badge.verified mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .badge.instant {
      background: #2196f3;
      color: white;
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
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ffa500;
    }

    .rating mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .location mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .features {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
    }

    .features span {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #666;
    }

    .features mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .amenities-preview {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .amenities-preview mat-icon {
      color: #666;
      font-size: 20px;
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

    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .filters-sidebar {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .properties-grid {
        grid-template-columns: 1fr;
      }

      .page-header h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class PropertyListComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private fb = inject(FormBuilder);

  properties = this.propertyService.properties;
  totalCount = this.propertyService.totalCount;
  loading = this.propertyService.loading;
  error = signal<string | null>(null);

  pageSize = signal(12);
  pageIndex = signal(0);
  viewMode = signal<'grid' | 'list'>('grid');
  selectedAmenities = signal<string[]>([]);

  ListingType = ListingType;

  propertyTypes = [
    { value: 'Apartment', label: 'Kvartira' },
    { value: 'House', label: 'Uy' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Office', label: 'Ofis' },
    { value: 'Commercial', label: 'Tijorat' },
    { value: 'Land', label: 'Yer' }
  ];

  listingTypes = [
    { value: 'Sale', label: 'Sotish' },
    { value: 'Rent', label: 'Ijaraga' },
    { value: 'ShortTermRent', label: 'Qisqa muddatli' }
  ];

  bedroomOptions = [1, 2, 3, 4, 5];

  amenitiesList = [
    { value: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
    { value: 'parking', label: 'Parking', icon: 'local_parking' },
    { value: 'pool', label: 'Hovuz', icon: 'pool' },
    { value: 'ac', label: 'Konditsioner', icon: 'ac_unit' },
    { value: 'kitchen', label: 'Oshxona', icon: 'kitchen' },
    { value: 'tv', label: 'TV', icon: 'tv' }
  ];

  filterForm = this.fb.group({
    location: [''],
    propertyType: [''],
    listingType: [''],
    minPrice: [''],
    maxPrice: [''],
    bedrooms: ['']
  });

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.error.set(null);
    
    this.propertyService.getAllProperties(
      this.pageIndex() + 1,
      this.pageSize()
    ).subscribe({
      error: (err) => {
        this.error.set('Mulklarni yuklashda xatolik yuz berdi');
        console.error('Error loading properties:', err);
      }
    });
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    const params: PropertySearchParams = {
      ...this.filterForm.value,
      page: 1,
      pageSize: this.pageSize(),
      amenities: this.selectedAmenities()
    };

    this.propertyService.searchProperties(params).subscribe({
      error: (err) => {
        this.error.set('Qidirishda xatolik yuz berdi');
        console.error('Error searching properties:', err);
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.selectedAmenities.set([]);
    this.pageIndex.set(0);
    this.loadProperties();
  }

  isAmenitySelected(value: string): boolean {
    return this.selectedAmenities().includes(value);
  }

  toggleAmenity(value: string): void {
    this.selectedAmenities.update(amenities => {
      if (amenities.includes(value)) {
        return amenities.filter(a => a !== value);
      }
      return [...amenities, value];
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadProperties();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
}
