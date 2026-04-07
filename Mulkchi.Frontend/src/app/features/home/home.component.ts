import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Property } from '../../core/models';
import { PropertyService } from '../../core/services/property.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    PropertyCardComponent,
    TranslateModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  loading = true;
  isSearching = false;

  // Search form fields
  searchRegion = '';
  searchType = '';
  searchPriceMin = 10000;
  searchPriceMax = 500000;
  showAdvancedFilters = false;
  rooms = '';

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
    'Qoraqalpog‘iston',
  ];

  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loading = true;

    // Load properties from API
    this.propertyService
      .getProperties(1, 8)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res?.items) {
            this.properties = res.items;
          } else if (Array.isArray(res)) {
            this.properties = res;
          } else {
            this.properties = [];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading properties:', err);
          this.loading = false;
        },
      });
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
    setTimeout(() => {
      this.isSearching = false;
      this.router.navigate(['/properties'], {
        queryParams: {
          region: this.searchRegion || undefined,
          type: this.searchType || undefined,
          minPrice: this.searchPriceMin,
          maxPrice: this.searchPriceMax,
          rooms: this.rooms || undefined,
        },
      });
    }, 600);
  }
}
