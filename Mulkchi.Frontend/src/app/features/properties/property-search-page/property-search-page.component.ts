import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Property, PropertySearchParams } from '../../../core/models/property.model';
import { PropertyService } from '../../../core/services/property.service';
import {
  MapMarker,
  PropertyMapComponent,
} from '../../../shared/components/property-map/property-map.component';
import { PropertyCardComponent } from '../components/property-card/property-card.component';
import { PropertyFilterBarComponent } from '../components/property-filter-bar/property-filter-bar.component';
import { PropertySkeletonComponent } from '../components/property-skeleton/property-skeleton.component';

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

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Read filters from URL on load
    this.route.queryParams.subscribe((qp) => {
      this.params = {
        page: +qp['page'] || 1,
        pageSize: 12,
        city: qp['city'],
        region: qp['region'],
        listingType: qp['listingType'] as any,
        minPrice: qp['minPrice'] ? +qp['minPrice'] : undefined,
        maxPrice: qp['maxPrice'] ? +qp['maxPrice'] : undefined,
        bedrooms: qp['bedrooms'] ? +qp['bedrooms'] : undefined,
        sortBy: qp['sortBy'],
        latitude: qp['latitude'] ? +qp['latitude'] : undefined,
        longitude: qp['longitude'] ? +qp['longitude'] : undefined,
        radiusKm: qp['radiusKm'] ? +qp['radiusKm'] : undefined,
      };
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
}
