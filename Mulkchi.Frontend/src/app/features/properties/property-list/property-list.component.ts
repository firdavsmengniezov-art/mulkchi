import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent implements OnInit, OnDestroy {
  properties: any[] = [];
  loading = true;
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  pageSize = 9;
  private destroy$ = new Subject<void>();

  // Filters
  filterRegion = '';
  filterType = '';
  filterListing = '';
  filterMinPrice = '';
  filterMaxPrice = '';
  filterBedrooms = '';

  regions = ['Toshkent','Samarqand','Buxoro','Namangan',
    'Andijon','Fargona','Qashqadaryo','Surxondaryo',
    'Xorazm','Navoiy','Jizzax','Sirdaryo'];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['region']) this.filterRegion = params['region'];
      if (params['type']) this.filterType = params['type'];
      if (params['listingType']) this.filterListing = params['listingType'];
      this.loadProperties();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProperties() {
    this.loading = true;
    
    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.properties = [
        { id: '1', title: 'Modern Apartment in Tashkent', city: 'Toshkent', district: 'Yunusobod', type: 'Apartment', listingType: 'Rent', monthlyRent: 500, area: 85, numberOfBedrooms: 2, numberOfBathrooms: 1, averageRating: 4.5, viewsCount: 120 },
        { id: '2', title: 'Cozy House in Samarkand', city: 'Samarqand', district: 'Bodomzor', type: 'House', listingType: 'Sale', salePrice: 150000, area: 120, numberOfBedrooms: 3, numberOfBathrooms: 2, averageRating: 4.8, viewsCount: 89 },
        { id: '3', title: 'Office Space in Center', city: 'Toshkent', district: 'Mirabad', type: 'Office', listingType: 'Rent', monthlyRent: 800, area: 60, numberOfBedrooms: 0, numberOfBathrooms: 1, averageRating: 4.2, viewsCount: 67 }
      ];
      this.totalCount = this.properties.length;
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      this.loading = false;
    }, 1000);
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadProperties();
  }

  clearFilters() {
    this.filterRegion = '';
    this.filterType = '';
    this.filterListing = '';
    this.filterMinPrice = '';
    this.filterMaxPrice = '';
    this.filterBedrooms = '';
    this.currentPage = 1;
    this.loadProperties();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProperties();
      window.scrollTo(0, 0);
    }
  }
}
