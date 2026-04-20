import { Component, OnInit, inject, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
import * as L from 'leaflet';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
          
          <!-- Hero Search -->
          <div class="hero-search">
            <mat-icon class="search-icon">search</mat-icon>
            <input 
              type="text" 
              class="hero-search-input" 
              placeholder="Shahar yoki tuman qidiring..."
              [value]="heroSearchValue()"
              (input)="heroSearchValue.set($any($event).target.value)"
              (keyup.enter)="onHeroSearch()">
            <button mat-raised-button color="primary" class="hero-search-btn" (click)="onHeroSearch()">
              Qidirish
            </button>
          </div>
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
              <button mat-icon-button [color]="viewMode() === 'map' ? 'primary' : ''" (click)="setViewMode('map')">
                <mat-icon>map</mat-icon>
              </button>
            </div>
          </div>

          <!-- Loading State with Skeleton Cards -->
          @if (loading()) {
            <div class="skeleton-grid">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="skeleton-card">
                  <div class="skeleton-image shimmer"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title shimmer"></div>
                    <div class="skeleton-text shimmer"></div>
                    <div class="skeleton-row">
                      <div class="skeleton-badge shimmer"></div>
                      <div class="skeleton-price shimmer"></div>
                    </div>
                  </div>
                </div>
              }
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
              <h3>Mulk topilmadi</h3>
              <p>Boshqa filterlardan foydalanib ko'ring yoki filterni tozalang</p>
              <button mat-raised-button color="primary" (click)="resetFilters()" class="clear-filters-btn">
                <mat-icon>clear_all</mat-icon>
                Filterni tozalash
              </button>
            </div>
          }

          <!-- Map View -->
          @if (!loading() && !error() && viewMode() === 'map') {
            <div class="map-container">
              <div id="property-map" class="property-map"></div>
            </div>
          }

          <!-- Properties Grid -->
          @if (!loading() && !error() && properties().length > 0 && viewMode() !== 'map') {
            <div class="properties-grid" [class.list-view]="viewMode() === 'list'">
              @for (property of properties(); track property.id) {
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

                    <div class="price-section"
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
      margin-bottom: 24px;
    }

    /* Hero Search */
    .hero-search {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      border-radius: 12px;
      padding: 8px;
      max-width: 500px;
      margin: 0 auto;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .hero-search .search-icon {
      color: #667eea;
      margin-left: 12px;
    }

    .hero-search-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 14px 12px;
      font-size: 1rem;
      background: transparent;
      min-width: 0;
    }

    .hero-search-input::placeholder {
      color: #999;
    }

    .hero-search-btn {
      border-radius: 8px !important;
      padding: 8px 24px !important;
    }

    @media (max-width: 600px) {
      .hero-search {
        flex-direction: column;
        gap: 8px;
        padding: 12px;
      }

      .hero-search-btn {
        width: 100%;
      }
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

    .empty-container h3 {
      color: #333;
      margin-bottom: 8px;
    }

    .empty-container p {
      color: #666;
      margin-bottom: 24px;
    }

    .clear-filters-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* Skeleton Loading */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    .skeleton-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .skeleton-image {
      height: 200px;
      background: #e2e8f0;
    }

    .skeleton-content {
      padding: 16px;
    }

    .skeleton-title {
      height: 20px;
      background: #e2e8f0;
      border-radius: 4px;
      margin-bottom: 12px;
      width: 80%;
    }

    .skeleton-text {
      height: 14px;
      background: #e2e8f0;
      border-radius: 4px;
      margin-bottom: 16px;
      width: 60%;
    }

    .skeleton-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .skeleton-badge {
      height: 24px;
      width: 60px;
      background: #e2e8f0;
      border-radius: 12px;
    }

    .skeleton-price {
      height: 24px;
      width: 100px;
      background: #e2e8f0;
      border-radius: 4px;
    }

    /* Shimmer Animation */
    .shimmer {
      position: relative;
      overflow: hidden;
    }

    .shimmer::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
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

    /* Map View Styles */
    .map-container {
      width: 100%;
      height: 600px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .property-map {
      width: 100%;
      height: 100%;
    }

    /* Leaflet Popup Styles */
    .property-popup .popup-title {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      color: #333;
    }

    .property-popup .popup-price {
      color: #667eea;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 8px;
    }

    .property-popup .popup-link {
      color: #667eea;
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
    }

    .property-popup .popup-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .map-container {
        height: 400px;
      }
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

    .property-card:active {
      transform: translateY(0);
    }

    .property-image {
      position: relative;
      height: 220px;
      overflow: hidden;
    }

    .property-image img {
      width: 100%;
      height: 220px;
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
      background: #D4A017;
      color: #000;
    }

    .badge.verified {
      background: white;
      color: #22c55e;
      padding: 4px;
      border-radius: 50%;
      border: 2px solid #22c55e;
    }

    .badge.verified mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .badge.instant {
      background: #166534;
      color: #86efac;
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
    }

    /* Price colors by listing type */
    .price-section.sale .price { color: #D4A017; }
    .price-section.rent .price { color: #4ade80; }
    .price-section.short-term .price { color: #60a5fa; }

    .type {
      font-size: 0.8rem;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .type.sale-type { background: #1e3a5f; color: #93c5fd; }
    .type.rent-type { background: #166534; color: #86efac; }
    .type.short-term-type { background: #1e40af; color: #93c5fd; }

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  properties = this.propertyService.properties;
  totalCount = this.propertyService.totalCount;
  loading = this.propertyService.loading;
  error = signal<string | null>(null);
  heroSearchValue = signal<string>('');

  pageSize = signal(12);
  pageIndex = signal(0);
  viewMode = signal<'grid' | 'list' | 'map'>('grid');
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
    // Handle query params from home page search
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.heroSearchValue.set(params['search']);
        this.filterForm.patchValue({ location: params['search'] });
      }
      if (params['listingType']) {
        this.filterForm.patchValue({ listingType: params['listingType'] });
      }
      // Apply filters after setting values
      setTimeout(() => this.applyFilters(), 0);
    });

    // Listen for navigation events from map popup
    window.addEventListener('navigateToProperty', (event: Event) => {
      const customEvent = event as CustomEvent;
      const propertyId = customEvent.detail?.propertyId;
      if (propertyId) {
        this.router.navigate(['/properties', propertyId]);
      }
    });
  }

  loadProperties(): void {
    this.error.set(null);
    
    this.propertyService.getAllProperties(
      this.pageIndex() + 1,
      this.pageSize()
    ).subscribe({
      error: () => {
        this.error.set('Mulklarni yuklashda xatolik yuz berdi');
      }
    });
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    
    // Filter out null values from form
    const formValue = this.filterForm.value;
    const cleanParams: Record<string, unknown> = {};
    
    Object.keys(formValue).forEach(key => {
      const value = (formValue as Record<string, unknown>)[key];
      if (value !== null && value !== undefined && value !== '') {
        cleanParams[key] = value;
      }
    });
    
    const params: PropertySearchParams = {
      ...cleanParams,
      page: 1,
      pageSize: this.pageSize(),
      amenities: this.selectedAmenities()
    };

    this.propertyService.searchProperties(params).subscribe({
      error: () => {
        this.error.set('Qidirishda xatolik yuz berdi');
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

  setViewMode(mode: 'grid' | 'list' | 'map'): void {
    this.viewMode.set(mode);
    if (mode === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
  }

  // Get image URL from property (handles multiple image formats)
  getImageUrl(property: Property): string {
    if (property.images && property.images.length > 0) {
      const firstImage = property.images[0] as any;
      return firstImage.url || firstImage.imageUrl || '';
    }
    if (property.imageUrl) return property.imageUrl;
    if (property.thumbnailUrl) return property.thumbnailUrl;
    return this.getPlaceholderImage(property);
  }

  // Handle image load error
  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const propertyType = img.getAttribute('data-property-type') || 'Apartment';
    img.src = this.getPlaceholderImage({ type: propertyType } as Property);
  }

  // Get placeholder image based on property type
  getPlaceholderImage(property: Property): string {
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

  // Hero search - update sidebar filter and apply
  onHeroSearch(): void {
    const searchValue = this.heroSearchValue().trim();
    if (searchValue) {
      // Update filter form location field
      this.filterForm.patchValue({ location: searchValue });
      // Scroll to filter sidebar
      document.querySelector('.filters-sidebar')?.scrollIntoView({ behavior: 'smooth' });
      // Apply filters
      this.applyFilters();
    }
  }

  // Leaflet Map instance
  private map: L.Map | null = null;

  // Initialize Leaflet Map
  initMap(): void {
    // Clean up existing map
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Wait for DOM to be ready
    const mapContainer = document.getElementById('property-map');
    if (!mapContainer) {
      return;
    }

    // Initialize map centered on Tashkent
    this.map = L.map('property-map').setView([41.2995, 69.2401], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Add markers for properties with coordinates
    const properties = this.properties();
    let markerCount = 0;

    properties.forEach(property => {
      // Check if property has valid coordinates
      if (property.latitude && property.longitude) {
        const lat = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude;
        const lng = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude;

        if (!isNaN(lat) && !isNaN(lng)) {
          // Create marker
          const marker = L.marker([lat, lng]).addTo(this.map!);

          // Create popup content
          const price = this.getPropertyPrice(property);
          const popupContent = `
            <div class="property-popup">
              <div class="popup-title">${property.title}</div>
              <div class="popup-price">${price}</div>
              <a href="javascript:void(0)" class="popup-link" onclick="window.navigateToPropertyDetail('${property.id}')">Ko'rish</a>
            </div>
          `;

          marker.bindPopup(popupContent);
          markerCount++;
        }
      }
    });

    // Fit bounds if we have markers
    if (markerCount > 0) {
      const bounds = L.latLngBounds(
        properties
          .filter(p => p.latitude && p.longitude)
          .map(p => [
            typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude!,
            typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude!
          ])
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Force map resize after container is visible
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  // Helper to get property price for popup
  private getPropertyPrice(property: Property): string {
    if (property.listingType === ListingType.Sale && property.salePrice) {
      return `${property.salePrice.toLocaleString()} ${property.currency}`;
    } else if (property.listingType === ListingType.Rent && property.monthlyRent) {
      return `${property.monthlyRent.toLocaleString()} ${property.currency}/oy`;
    } else if (property.listingType === ListingType.ShortTermRent && property.pricePerNight) {
      return `${property.pricePerNight.toLocaleString()} ${property.currency}/tun`;
    }
    return 'Narx ko\'rsatilmagan';
  }
}
