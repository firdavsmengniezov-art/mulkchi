import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Property } from '../../core/models';
import { PropertyService } from '../../core/services/property.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
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
    'Qoraqalpog\u2019iston',
  ];

  private propertyService = inject(PropertyService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loading = true;

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
    setTimeout(() => { this.isSearching = false; }, 300);
  }
}
