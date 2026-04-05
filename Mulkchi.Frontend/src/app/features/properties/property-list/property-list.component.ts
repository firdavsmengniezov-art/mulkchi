import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';

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
})
export class PropertyListComponent implements OnInit, OnDestroy {
  properties: any[] = [];
  loading = true;
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 9;
  private destroy$ = new Subject<void>();

  // UI State
  viewMode: 'grid' | 'list' = 'grid';
  showMobileFilters = false;
  isBrowser = false;
  windowWidth = 1024;

  // Filters
  filterRegion = '';
  filterType = '';
  filterListing = '';
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;
  filterBedrooms = '';
  sortBy = 'newest';

  // New location filters
  filterMetro = false;
  filterMarket = false;
  filterSchool = false;
  filterHospital = false;

  regions = [
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
    }
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['region']) this.filterRegion = params['region'];
      if (params['type']) this.filterType = params['type'];
      if (params['listingType']) this.filterListing = params['listingType'];
      if (params['minPrice']) this.filterMinPrice = params['minPrice'];
      if (params['maxPrice']) this.filterMaxPrice = params['maxPrice'];
      if (params['rooms']) this.filterBedrooms = params['rooms'];
      this.loadProperties();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.filterRegion) count++;
    if (this.filterType) count++;
    if (this.filterListing) count++;
    if (this.filterMinPrice || this.filterMaxPrice) count++;
    if (this.filterBedrooms) count++;
    if (this.filterMetro) count++;
    if (this.filterMarket) count++;
    if (this.filterSchool) count++;
    if (this.filterHospital) count++;
    return count;
  }

  removeFilter(filterName: string) {
    if (
      filterName.startsWith('filterM') ||
      filterName.startsWith('filterS') ||
      filterName.startsWith('filterH')
    ) {
      if (typeof (this as any)[filterName] === 'boolean') {
        (this as any)[filterName] = false;
      } else {
        (this as any)[filterName] = filterName.includes('Price') ? null : '';
      }
    } else {
      (this as any)[filterName] = filterName.includes('Price') ? null : '';
    }
    this.applyFilters();
  }

  toggleMobileFilters() {
    this.showMobileFilters = !this.showMobileFilters;
    if (this.isBrowser) {
      document.body.style.overflow = this.showMobileFilters ? 'hidden' : '';
    }
  }

  loadProperties() {
    this.loading = true;

    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.properties = [
        {
          id: '1',
          title: 'Modern Apartment in Tashkent',
          titleUzAscii: 'Toshkentda zamonaviy kvartira',
          city: 'Toshkent',
          district: 'Yunusobod',
          propertyType: 'Apartment',
          listingType: 'Rent',
          monthlyRent: 500,
          area: 85,
          numberOfBedrooms: 2,
          numberOfBathrooms: 1,
          averageRating: 4.5,
          viewsCount: 120,
          createdAt: new Date().toISOString(),
          images: [{ url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600' }],
        },
        {
          id: '2',
          title: 'Cozy House in Bodomzor',
          titleUzAscii: 'Bodomzorda shinam sharqona hovli',
          city: 'Samarqand',
          district: 'Bodomzor',
          propertyType: 'House',
          listingType: 'Sale',
          salePrice: 150000,
          area: 120,
          numberOfBedrooms: 3,
          numberOfBathrooms: 2,
          averageRating: 4.8,
          viewsCount: 89,
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600' }],
        },
        {
          id: '3',
          title: 'Office Space in Center',
          titleUzAscii: 'Markazda biznes ofis',
          city: 'Toshkent',
          district: 'Mirobod',
          propertyType: 'Office',
          listingType: 'Rent',
          monthlyRent: 800,
          area: 60,
          numberOfBedrooms: 0,
          numberOfBathrooms: 1,
          averageRating: 4.2,
          viewsCount: 67,
          createdAt: new Date().toISOString(),
          images: [{ url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600' }],
        },
        {
          id: '4',
          title: 'Luxury Villa with Pool',
          titleUzAscii: 'Hovuzli hashamatli villa',
          city: 'Toshkent',
          district: 'Qibray',
          propertyType: 'House',
          listingType: 'Sale',
          salePrice: 450000,
          area: 450,
          numberOfBedrooms: 5,
          numberOfBathrooms: 4,
          averageRating: 5.0,
          viewsCount: 340,
          createdAt: new Date().toISOString(),
          images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600' }],
        },
      ];
      this.totalCount = this.properties.length;
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      this.loading = false;
    }, 800);
  }

  applyFilters() {
    this.currentPage = 1;
    this.router.navigate(['/properties'], {
      queryParams: {
        region: this.filterRegion || undefined,
        type: this.filterType || undefined,
        listingType: this.filterListing || undefined,
        minPrice: this.filterMinPrice || undefined,
        maxPrice: this.filterMaxPrice || undefined,
        rooms: this.filterBedrooms || undefined,
      },
    });
    if (this.showMobileFilters) {
      this.toggleMobileFilters();
    }
  }

  clearFilters() {
    this.filterRegion = '';
    this.filterType = '';
    this.filterListing = '';
    this.filterMinPrice = null;
    this.filterMaxPrice = null;
    this.filterBedrooms = '';
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loading = true;
      this.loadProperties();
      if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
