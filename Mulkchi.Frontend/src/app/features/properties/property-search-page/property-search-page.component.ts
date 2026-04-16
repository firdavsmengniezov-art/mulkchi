import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { Property, PropertySearchParams } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import {
  MapMarker,
  PropertyMapComponent,
} from '../../../shared/components/property-map/property-map.component';
import { PropertyCardComponent } from '../components/property-card/property-card.component';
import { PropertyFilterBarComponent } from '../components/property-filter-bar/property-filter-bar.component';
import { PropertySkeletonComponent } from '../components/property-skeleton/property-skeleton.component';

interface FilterState {
  apartment: boolean;
  house: boolean;
  land: boolean;
  commercial: boolean;
  minPrice: number;
  maxPrice: number;
  rooms: number[];
  minArea: number;
  maxArea: number;
  hasParking: boolean;
  hasFurniture: boolean;
  newBuilding: boolean;
  hasRepair: boolean;
}

@Component({
  selector: 'app-property-search-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PropertyFilterBarComponent,
    PropertyCardComponent,
    PropertySkeletonComponent,
    PropertyMapComponent,
  ],
  templateUrl: './property-search-page.component.html',
  styleUrls: ['./property-search-page.component.scss'],
})
export class PropertySearchPageComponent implements OnInit {
  properties: Property[] = [];
  totalCount = 0;
  isLoading = true;
  params: PropertySearchParams = { page: 1, pageSize: 12 };
  showMapView = false;
  searchLocation = '';
  
  // New filter state for redesigned UI
  filters: FilterState = {
    apartment: false,
    house: false,
    land: false,
    commercial: false,
    minPrice: 0,
    maxPrice: 500000,
    rooms: [],
    minArea: 0,
    maxArea: 1000,
    hasParking: false,
    hasFurniture: false,
    newBuilding: false,
    hasRepair: false
  };
  
  private filterSubject = new Subject<void>();
  private debounceTimeMs = 500;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Setup debounced filter
    this.filterSubject.pipe(
      debounceTime(this.debounceTimeMs)
    ).subscribe(() => {
      this.applyFilters();
    });
    
    // Read filters from URL on load
    this.route.queryParams.subscribe((qp) => {
      this.params = {
        page: +qp['page'] || 1,
        pageSize: 12,
        city: qp['city'],
        region: qp['region'],
        location: qp['location'],
        listingType: qp['listingType'] as any,
        minPrice: qp['minPrice'] ? +qp['minPrice'] : undefined,
        maxPrice: qp['maxPrice'] ? +qp['maxPrice'] : undefined,
        bedrooms: qp['bedrooms'] ? +qp['bedrooms'] : undefined,
        sortBy: qp['sortBy'],
        latitude: qp['latitude'] ? +qp['latitude'] : undefined,
        longitude: qp['longitude'] ? +qp['longitude'] : undefined,
        radiusKm: qp['radiusKm'] ? +qp['radiusKm'] : undefined,
      };
      
      // Set search location for display
      this.searchLocation = qp['location'] || qp['city'] || qp['region'] || '';
      
      // Initialize filter state from URL params
      this.initializeFiltersFromParams();
      this.loadProperties();
    });
  }

  onFiltersChanged(newParams: PropertySearchParams) {
    this.params = { ...newParams, page: 1 };
    // Sync to URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.params,
      queryParamsHandling: 'merge',
    });
  }

  loadProperties() {
    this.isLoading = true;

    // NOTE: Using getAll instead of empty observable as fallback
    // Since getProperties/getAll properties method typically returns PagedResult
    this.propertyService.searchProperties(this.params).subscribe({
      next: (result: any) => {
        // Adapt based on returned DTO structure
        this.properties = result.items || [];
        this.totalCount = result.totalCount || this.properties.length;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  onPageChange(page: number) {
    this.onFiltersChanged({ ...this.params, page });
  }

  onFavoriteToggled(propertyId: string) {
    // Not fully implemented on backend in this context example, so stub call if needed
    // this.propertyService.toggleFavorite(propertyId).subscribe();
  }

  toggleView() {
    this.showMapView = !this.showMapView;
  }

  get mapMarkers(): MapMarker[] {
    return this.properties
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({
        lat: p.latitude!,
        lng: p.longitude!,
        title: p.title,
        popup: `<strong>${p.title}</strong><br>${p.address || ''}`,
      }));
  }

  get skeletonArray() {
    return Array(12);
  }

  get totalPages() {
    return Math.ceil(this.totalCount / this.params.pageSize!);
  }
  
  // New methods for redesigned UI
  setViewMode(showMap: boolean) {
    this.showMapView = showMap;
  }
  
  resetFilters() {
    this.filters = {
      apartment: false,
      house: false,
      land: false,
      commercial: false,
      minPrice: 0,
      maxPrice: 500000,
      rooms: [],
      minArea: 0,
      maxArea: 1000,
      hasParking: false,
      hasFurniture: false,
      newBuilding: false,
      hasRepair: false
    };
    this.applyFilters();
  }
  
  toggleRooms(roomCount: number) {
    const index = this.filters.rooms.indexOf(roomCount);
    if (index > -1) {
      this.filters.rooms.splice(index, 1);
    } else {
      this.filters.rooms.push(roomCount);
    }
    this.applyFilters();
  }
  
  debounceFilter() {
    this.filterSubject.next();
  }
  
  applyFilters() {
    // Build property types array
    const propertyTypes: string[] = [];
    if (this.filters.apartment) propertyTypes.push('apartment');
    if (this.filters.house) propertyTypes.push('house');
    if (this.filters.land) propertyTypes.push('land');
    if (this.filters.commercial) propertyTypes.push('commercial');
    
    this.params = {
      ...this.params,
      page: 1, // Reset to first page when filters change
      minPrice: this.filters.minPrice > 0 ? this.filters.minPrice : undefined,
      maxPrice: this.filters.maxPrice > 0 ? this.filters.maxPrice : undefined,
      bedrooms: this.filters.rooms.length > 0 ? this.filters.rooms[0] : undefined, // Simplified for now
      propertyTypes: propertyTypes.length > 0 ? propertyTypes : undefined
    };
    
    this.updateURL();
    this.loadProperties();
  }
  
  initializeFiltersFromParams() {
    if (this.params.minPrice) this.filters.minPrice = this.params.minPrice;
    if (this.params.maxPrice) this.filters.maxPrice = this.params.maxPrice;
    if (this.params.bedrooms) this.filters.rooms = [this.params.bedrooms];
    if (this.params.propertyTypes) {
      this.filters.apartment = this.params.propertyTypes.includes('apartment');
      this.filters.house = this.params.propertyTypes.includes('house');
      this.filters.land = this.params.propertyTypes.includes('land');
      this.filters.commercial = this.params.propertyTypes.includes('commercial');
    }
  }
  
  updateURL() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.params,
      queryParamsHandling: 'merge',
    });
  }
  
  saveSearch() {
    // TODO: Implement save search functionality
    console.log('Save search:', this.params);
  }
  
  getPageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.params.page || 1;
    const delta = 2; // Show 2 pages before and after current
    
    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);
    
    // Always show at least 5 pages if available
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(total, 5);
      } else if (end === total) {
        start = Math.max(1, total - 4);
      }
    }
    
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
