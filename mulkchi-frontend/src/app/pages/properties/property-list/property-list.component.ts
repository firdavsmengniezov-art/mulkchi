import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertyFilter, ListingType } from '../../../core/models/property.models';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PropertyCardComponent, LoadingSpinnerComponent],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  properties: Property[] = [];
  totalCount = 0;
  isLoading = false;
  currentPage = 1;
  pageSize = 12;

  // Filters
  filterCity = '';
  filterListingType: ListingType | '' = '';
  filterMinPrice: number | null = null;
  filterMaxPrice: number | null = null;
  filterBedrooms: number | null = null;

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filterCity = params['city'] ?? '';
      this.filterListingType = params['listingType'] ?? '';
      this.filterBedrooms = params['bedrooms'] ? +params['bedrooms'] : null;
      this.loadProperties();
    });
  }

  loadProperties(): void {
    this.isLoading = true;
    const filter: PropertyFilter = {
      page: this.currentPage,
      pageSize: this.pageSize
    };
    if (this.filterCity) filter.city = this.filterCity;
    if (this.filterListingType) filter.listingType = this.filterListingType as ListingType;
    if (this.filterMinPrice != null) filter.minPrice = this.filterMinPrice;
    if (this.filterMaxPrice != null) filter.maxPrice = this.filterMaxPrice;
    if (this.filterBedrooms != null) filter.bedrooms = this.filterBedrooms;

    this.propertyService.getAll(filter).subscribe({
      next: (result) => {
        this.properties = result.items;
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  setListingType(type: ListingType | ''): void {
    this.filterListingType = type;
  }

  setBedrooms(count: number | null): void {
    this.filterBedrooms = count;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProperties();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
