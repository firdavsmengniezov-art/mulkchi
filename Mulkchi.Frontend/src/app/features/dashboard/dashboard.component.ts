import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BookingService } from '../../core/services/booking.service';
import { PropertyService } from '../../core/services/property.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  properties: any[] = [];
  bookings: any[] = [];
  loading = true;
  activeTab = 'properties';
  // Stats
  totalProperties = 0;
  totalBookings = 0;

  constructor(
    private analyticsService: AnalyticsService,
    private propertyService: PropertyService,
    private bookingService: BookingService,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    forkJoin({
      marketOverview: this.analyticsService
        .getMarketOverview()
        .pipe(catchError(() => of(null))),
      byRegion: this.analyticsService
        .getByRegion()
        .pipe(catchError(() => of([]))),
      properties: this.propertyService
        .getProperties(1, 50)
        .pipe(map((result) => result.items ?? []), catchError(() => of([]))),
      bookings: this.bookingService
        .getMyBookings(1, 50)
        .pipe(map((result) => result.items ?? []), catchError(() => of([]))),
    }).subscribe(({ marketOverview, byRegion, properties, bookings }) => {
      const overview = (marketOverview ?? {}) as any;
      const regionData = Array.isArray(byRegion) ? byRegion : [];

      this.properties = properties;
      this.bookings = bookings;
      this.totalProperties = Number(
        overview.totalListings ??
          overview.totalProperties ??
          regionData.reduce((sum: number, item: any) => sum + (item.listingsCount ?? 0), 0) ??
          properties.length,
      );
      this.totalBookings = bookings.length;
      this.loading = false;
    });
  }

  deleteProperty(id: string) {
    if (!confirm('Mulkni o\'chirishni tasdiqlaysizmi?')) return;
    this.propertyService.deleteProperty(id).subscribe({
      next: () => {
        this.properties = this.properties.filter((p) => p.id !== id);
        this.totalProperties = Math.max(0, this.totalProperties - 1);
      },
    });
  }

  getListingTypeText(type: string): string {
    const map: any = { 'Rent': 'Ijara', 'Sale': 'Sotiladi', 'DailyRent': 'Kunlik' };
    return map[type] || type;
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Cancelled': 'status-cancelled',
      'Completed': 'status-completed'
    };
    return map[status] || '';
  }

  getStatusText(status: string): string {
    const map: any = {
      'Pending': 'Kutilmoqda',
      'Confirmed': 'Tasdiqlangan',
      'Cancelled': 'Bekor qilingan',
      'Completed': 'Tugallangan'
    };
    return map[status] || status;
  }

  getPrice(p: any): string {
    if (p.monthlyRent) return `$${p.monthlyRent}/oy`;
    if (p.salePrice) return `$${p.salePrice.toLocaleString()}`;
    if (p.pricePerNight) return `$${p.pricePerNight}/kun`;
    return 'Narx mavjud emas';
  }
}
