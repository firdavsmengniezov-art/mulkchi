import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, HostListener, inject, Inject, OnDestroy, OnInit, PLATFORM_ID, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';
import { Property } from '../../../core/models/property.model';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    PropertyCardComponent,
    NavbarComponent,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSliderModule,
    MatButtonToggleModule,
  ],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyListComponent implements OnInit, OnDestroy {
  // ============ DEPENDENCY INJECTION ============
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  @Inject(PLATFORM_ID) private platformId!: Object;

  // ============ SIGNAL STATE ============
  readonly properties = signal<Property[]>([]);
  readonly loading = signal<boolean>(true);
  readonly totalCount = signal<number>(0);
  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(9);

  // UI State Signals
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly showMobileFilters = signal<boolean>(false);
  readonly isBrowser = signal<boolean>(false);
  readonly windowWidth = signal<number>(1024);

  // Filter Signals
  readonly filterRegion = signal<string>('');
  readonly filterType = signal<string>('');
  readonly filterListing = signal<string>('');
  readonly filterMinPrice = signal<number | null>(null);
  readonly filterMaxPrice = signal<number | null>(null);
  readonly filterBedrooms = signal<string>('');
  readonly sortBy = signal<string>('newest');

  // Location filter signals
  readonly filterMetro = signal<boolean>(false);
  readonly filterMarket = signal<boolean>(false);
  readonly filterSchool = signal<boolean>(false);
  readonly filterHospital = signal<boolean>(false);

  // ============ COMPUTED VALUES ============
  readonly activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filterRegion()) count++;
    if (this.filterType()) count++;
    if (this.filterListing()) count++;
    if (this.filterMinPrice() || this.filterMaxPrice()) count++;
    if (this.filterBedrooms()) count++;
    if (this.filterMetro()) count++;
    if (this.filterMarket()) count++;
    if (this.filterSchool()) count++;
    if (this.filterHospital()) count++;
    return count;
  });

  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly hasPreviousPage = computed(() => this.currentPage() > 1);

  readonly regions = [
    'Toshkent',
    'Samarqand',
    'Buxoro',
    'Namangan',
    'Andijon',
    'Fargona',
    'Qashqadaryo',
    'Surxondaryo',
    'Xorazm',
    'Navoiy',
    'Jizzax',
    'Sirdaryo',
    'Qoraqalpog‘iston',
  ];

  constructor() {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if (this.isBrowser()) {
      this.windowWidth.set(window.innerWidth);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser()) {
      this.windowWidth.set(window.innerWidth);
    }
  }

  // Query params signal from route
  queryParams = toSignal(this.route.queryParams, { initialValue: {} });

  ngOnInit() {
    // React to query params changes via signal
    const params = this.queryParams() as Record<string, string | undefined>;
    if (params['region']) this.filterRegion.set(params['region']);
    if (params['type']) this.filterType.set(params['type']);
    if (params['listingType']) this.filterListing.set(params['listingType']);
    if (params['minPrice']) this.filterMinPrice.set(Number(params['minPrice']));
    if (params['maxPrice']) this.filterMaxPrice.set(Number(params['maxPrice']));
    if (params['rooms']) this.filterBedrooms.set(params['rooms']);
    this.loadProperties();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  removeFilter(filterName: keyof this & string) {
    switch (filterName) {
      case 'filterRegion':
        this.filterRegion.set('');
        break;
      case 'filterType':
        this.filterType.set('');
        break;
      case 'filterListing':
        this.filterListing.set('');
        break;
      case 'filterMinPrice':
      case 'filterMaxPrice':
        this.filterMinPrice.set(null);
        this.filterMaxPrice.set(null);
        break;
      case 'filterBedrooms':
        this.filterBedrooms.set('');
        break;
      case 'filterMetro':
        this.filterMetro.set(false);
        break;
      case 'filterMarket':
        this.filterMarket.set(false);
        break;
      case 'filterSchool':
        this.filterSchool.set(false);
        break;
      case 'filterHospital':
        this.filterHospital.set(false);
        break;
    }
    this.applyFilters();
  }

  toggleMobileFilters() {
    this.showMobileFilters.update(v => !v);
    if (this.isBrowser()) {
      document.body.style.overflow = this.showMobileFilters() ? 'hidden' : '';
    }
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  loadProperties() {
    this.loading.set(true);

    // Simulate API call - replace with PropertyAgent
    setTimeout(() => {
      const mockProperties: Property[] = [
        {
          id: '1',
          title: 'Modern Apartment in Tashkent',
          description: 'Toshkentda zamonaviy kvartira',
          address: 'Yunusobod tumani, Amir Temur ko\'chasi',
          city: 'Toshkent',
          region: 'Toshkent',
          type: 'Apartment' as any,
          listingType: 'Rent' as any,
          status: 'Available' as any,
          monthlyRent: 500,
          area: 85,
          numberOfBedrooms: 2,
          numberOfBathrooms: 1,
          averageRating: 4.5,
          viewsCount: 120,
          hostId: '1',
          ownerId: '1',
          isActive: true,
          images: [{ id: '1', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600', isMain: true }],
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          currency: 'UZS' as any,
          exchangeRate: 1,
          maxGuests: 4,
          isFeatured: false,
          isVerified: true,
          isVacant: true,
          isInstantBook: false,
          hasMetroNearby: true,
          hasBusStop: true,
          hasMarketNearby: true,
          hasSchoolNearby: true,
          hasHospitalNearby: false,
          hasWifi: true,
          hasParking: true,
          hasPool: false,
          petsAllowed: false,
          hasElevator: true,
          hasSecurity: true,
          hasGenerator: false,
          hasGas: true,
          hasFurniture: true,
          isRenovated: true,
          hasAirConditioning: true,
          hasHeating: true,
          hasWasher: true,
          hasKitchen: true,
          hasTV: true,
          hasWorkspace: false,
          isSelfCheckIn: false,
          isChildFriendly: true,
          isAccessible: false,
          favoritesCount: 15,
          reviewsCount: 8,
        },
        {
          id: '2',
          title: 'Cozy House in Bodomzor',
          description: 'Bodomzorda shinam sharqona hovli',
          address: 'Bodomzor mahallasi, 45-uy',
          city: 'Samarqand',
          region: 'Samarqand',
          type: 'House' as any,
          listingType: 'Sale' as any,
          status: 'Available' as any,
          salePrice: 150000,
          area: 120,
          numberOfBedrooms: 3,
          numberOfBathrooms: 2,
          averageRating: 4.8,
          viewsCount: 89,
          hostId: '2',
          ownerId: '2',
          isActive: true,
          images: [{ id: '1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600', isMain: true }],
          createdDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedDate: new Date().toISOString(),
          currency: 'UZS' as any,
          exchangeRate: 1,
          maxGuests: 6,
          isFeatured: true,
          isVerified: true,
          isVacant: true,
          isInstantBook: true,
          hasMetroNearby: false,
          hasBusStop: true,
          hasMarketNearby: true,
          hasSchoolNearby: true,
          hasHospitalNearby: true,
          hasWifi: true,
          hasParking: true,
          hasPool: true,
          petsAllowed: true,
          hasElevator: false,
          hasSecurity: true,
          hasGenerator: true,
          hasGas: true,
          hasFurniture: true,
          isRenovated: true,
          hasAirConditioning: true,
          hasHeating: true,
          hasWasher: true,
          hasKitchen: true,
          hasTV: true,
          hasWorkspace: true,
          isSelfCheckIn: true,
          isChildFriendly: true,
          isAccessible: false,
          favoritesCount: 25,
          reviewsCount: 12,
        },
      ];

      this.properties.set(mockProperties);
      this.totalCount.set(mockProperties.length);
      this.loading.set(false);
    }, 800);
  }

  applyFilters() {
    this.currentPage.set(1);
    this.router.navigate(['/properties'], {
      queryParams: {
        region: this.filterRegion() || undefined,
        type: this.filterType() || undefined,
        listingType: this.filterListing() || undefined,
        minPrice: this.filterMinPrice() || undefined,
        maxPrice: this.filterMaxPrice() || undefined,
        rooms: this.filterBedrooms() || undefined,
      },
    });
    if (this.showMobileFilters()) {
      this.toggleMobileFilters();
    }
  }

  clearFilters() {
    this.filterRegion.set('');
    this.filterType.set('');
    this.filterListing.set('');
    this.filterMinPrice.set(null);
    this.filterMaxPrice.set(null);
    this.filterBedrooms.set('');
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loading.set(true);
      this.loadProperties();
      if (this.isBrowser()) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
