import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PropertyService } from '../../core/services/property.service';
import { Property, ListingType, PropertyType, PropertyCategory } from '../../core/interfaces/property.interface';
import { PagedResult } from '../../core/interfaces/common.interface';

interface PropertySearchRequest {
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  listingType?: ListingType;
  propertyType?: PropertyType;
  propertyCategory?: PropertyCategory;
  pageNumber?: number;
  pageSize?: number;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  properties: Property[] = [];
  loading = false;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 12;

  // Search filters
  searchRequest: PropertySearchRequest = {
    pageNumber: 1,
    pageSize: 12
  };

  // Enum values for select options
  listingTypes = Object.values(ListingType);
  propertyTypes = Object.values(PropertyType);
  propertyCategories = Object.values(PropertyCategory);
  regions = [
    'Toshkent', 'Samarqand', 'Buxoro', 'Farg\'ona', 'Andijon', 'Namangan',
    'Qashqadaryo', 'Surxondaryo', 'Jizzax', 'Sirdaryo', 'Xorazm',
    'Qoraqalpog\'iston', 'Toshkent viloyati', 'Navoiy'
  ];

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.loading = true;
    this.searchRequest.pageNumber = this.pageNumber;
    this.searchRequest.pageSize = this.pageSize;

    this.propertyService.searchProperties(this.searchRequest).subscribe({
      next: (result: PagedResult<Property>) => {
        this.properties = result.items;
        this.totalCount = result.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadProperties();
  }

  onClearFilters(): void {
    this.searchRequest = {
      pageNumber: 1,
      pageSize: 12
    };
    this.pageNumber = 1;
    this.loadProperties();
  }

  onPageChange(event: any): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadProperties();
  }

  navigateToPropertyDetail(id: string): void {
    this.router.navigate(['/property', id]);
  }

  getListingTypeName(type: ListingType): string {
    const names: { [key in ListingType]: string } = {
      [ListingType.Rent]: 'Ijaraga',
      [ListingType.Sale]: 'Sotish',
      [ListingType.DailyRent]: 'Kunlik ijaraga'
    };
    return names[type] || String(type);
  }

  getPropertyTypeName(type: PropertyType): string {
    const names: { [key in PropertyType]: string } = {
      [PropertyType.Apartment]: 'Kvartira',
      [PropertyType.House]: 'Uy',
      [PropertyType.Office]: 'Ofis',
      [PropertyType.Land]: 'Yer',
      [PropertyType.Commercial]: 'Tijorat'
    };
    return names[type] || String(type);
  }

  formatPrice(price: number, currency: string): string {
    if (currency === 'USD') {
      return `$${price.toLocaleString()}`;
    }
    return `${price.toLocaleString()} UZS`;
  }
}
