import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Property } from '../../core/models';
import { LoggingService } from '../../core/services/logging.service';
import { PropertyService } from '../../core/services/property.service';
import { AiRecommendationsComponent } from '../../shared/components/ai-recommendations/ai-recommendations.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface SearchQuery {
  location: string;
  propertyType: string;
  priceRange: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    PropertyCardComponent,
    AiRecommendationsComponent,
    TranslateModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  loading = true;
  isSearching = false;
  selectedQuickTag = '';
  currentView: 'grid' | 'list' | 'map' = 'grid';
  sortBy: 'newest' | 'priceAsc' | 'priceDesc' = 'newest';
  userLatitude: number | null = null;
  userLongitude: number | null = null;
  hasUserLocation = false;

  // Search form fields
  searchRegion = '';
  searchType = '';
  searchPriceMin = 10000;
  searchPriceMax = 500000;
  showAdvancedFilters = false;
  rooms = '';

  // New search query for redesigned form
  searchQuery: SearchQuery = {
    location: '',
    propertyType: '',
    priceRange: ''
  };

  // Regions list
  regions = [
    'Toshkent',
    'Andijon',
    'Buxoro',
    "Farg'ona",
    'Jizzax',
    'Xorazm',
    'Namangan',
    'Navoiy',
    'Qashqadaryo',
    'Samarqand',
    'Sirdaryo',
    'Surxondaryo',
    'Qoraqalpog\u2019iston',
  ];

  readonly quickTags = ['Yangi binolar', 'Premium', 'Markazda', 'Metro yaqinida', 'Park yaqinida'];

  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private logger = inject(LoggingService);

  ngOnInit() {
    this.loading = true;
    this.captureUserLocation();

    this.propertyService
      .getProperties(1, 8)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: PagedResult<Property> | Property[]) => {
          if (res && !Array.isArray(res) && res.items) {
            this.properties = res.items;
          } else if (Array.isArray(res)) {
            this.properties = res;
          } else {
            this.properties = [];
          }
          this.loading = false;
        },
        error: (err) => {
          this.logger.error('Error loading properties:', err);
          this.loading = false;
        },
      });
  }

  private captureUserLocation(): void {
    if (!('geolocation' in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLatitude = position.coords.latitude;
        this.userLongitude = position.coords.longitude;
        this.hasUserLocation = true;
      },
      () => {
        this.hasUserLocation = false;
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 300000,
      },
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  search() {
    this.isSearching = true;
    this.router.navigate(['/properties'], {
      queryParams: {
        region: this.searchRegion || undefined,
        type: this.searchType || undefined,
        minPrice: this.searchPriceMin,
        maxPrice: this.searchPriceMax,
        rooms: this.rooms || undefined,
      },
    });
    // Small delay just to show the spinner UX feedback
    setTimeout(() => {
      this.isSearching = false;
    }, 300);
  }

  onSearch(event: Event) {
    event.preventDefault();
    this.isSearching = true;
    
    // Parse price range if provided
    let minPrice = undefined;
    let maxPrice = undefined;
    
    if (this.searchQuery.priceRange) {
      if (this.searchQuery.priceRange === '0-50000') {
        minPrice = 0;
        maxPrice = 50000;
      } else if (this.searchQuery.priceRange === '50000-100000') {
        minPrice = 50000;
        maxPrice = 100000;
      } else if (this.searchQuery.priceRange === '100000-200000') {
        minPrice = 100000;
        maxPrice = 200000;
      } else if (this.searchQuery.priceRange === '200000+') {
        minPrice = 200000;
        maxPrice = undefined;
      }
    }

    this.router.navigate(['/properties'], {
      queryParams: {
        location: this.searchQuery.location || undefined,
        type: this.searchQuery.propertyType || undefined,
        minPrice: minPrice,
        maxPrice: maxPrice,
      },
    });

    // Small delay just to show the spinner UX feedback
    setTimeout(() => {
      this.isSearching = false;
    }, 300);
  }

  get vipProperties(): Property[] {
    return this.properties.slice(0, 4);
  }

  get standardProperties(): Property[] {
    return this.properties.slice(4);
  }

  selectQuickTag(tag: string): void {
    this.selectedQuickTag = this.selectedQuickTag === tag ? '' : tag;
  }

  setView(view: 'grid' | 'list' | 'map'): void {
    this.currentView = view;
  }
}
