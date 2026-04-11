import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { BookingService } from '../../../core/services/booking.service';
import { PropertyService } from '../../../core/services/property.service';
import { ReviewService } from '../../../core/services/review.service';

import { LoggingService } from '../../../core/services/logging.service';
import { PropertyMapComponent } from '../../../shared/components/property-map/property-map.component';
import { PropertyCardComponent } from '../components/property-card/property-card.component';
import { AmenitiesGridComponent } from './components/amenities-grid/amenities-grid.component';
import { BookingWidgetComponent } from './components/booking-widget/booking-widget.component';
import { HostCardComponent } from './components/host-card/host-card.component';
import { PropertyImageGalleryComponent } from './components/property-image-gallery/property-image-gallery.component';
import { PropertyReviewsComponent } from './components/property-reviews/property-reviews.component';

@Component({
  selector: 'app-property-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PropertyImageGalleryComponent,
    BookingWidgetComponent,
    AmenitiesGridComponent,
    HostCardComponent,
    PropertyReviewsComponent,
    PropertyCardComponent,
    PropertyMapComponent,
  ],
  templateUrl: './property-detail-page.component.html',
  styleUrls: ['./property-detail-page.component.scss'],
})
export class PropertyDetailPageComponent implements OnInit {
  property: any;
  reviewSummary: any;
  similarProperties: any[] = [];
  blockedDates: string[] = [];
  descExpanded = false;
  mapUrl!: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private reviewService: ReviewService,
    private bookingService: BookingService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private logger: LoggingService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadPropertyDetail(id);
      }
    });
  }

  loadPropertyDetail(id: string) {
    window.scrollTo(0, 0);

    // 1. Get property
    this.propertyService.getProperty(id).subscribe((prop) => {
      this.property = prop;

      // Generate Maps Iframe
      const q = encodeURI(`${this.property.address}, ${this.property.city}`);
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://maps.google.com/maps?q=${q}&t=&z=13&ie=UTF8&iwloc=&output=embed`,
      );
    });

    // 2. Track view asynchronously
    this.http.post(`${environment.apiUrl}/properties/${id}/views`, {}).subscribe({
      error: (e) => this.logger.log('View track ignored', e),
    });

    // 3. Review Summary
    this.reviewService.getReviewSummary(id).subscribe({
      next: (summary) => (this.reviewSummary = summary),
      error: () => {},
    });

    // 4. Blocked dates
    const current = new Date();
    this.bookingService
      .getBlockedDates(id, current.getFullYear(), current.getMonth() + 1)
      .subscribe({
        next: (res) => (this.blockedDates = res?.blockedDates || []),
        error: () => {},
      });

    // 5. Similar
    this.propertyService.getSimilarProperties(id, 6).subscribe({
      next: (res) => (this.similarProperties = res || []),
      error: () => {},
    });
  }

  onBookingCreated(event: any) {
    this.bookingService.createPropertyBooking(event).subscribe({
      next: (res) => {
        alert('Mulk muvaffaqiyatli band qilindi!');
        // Ideally navigate to bookings profile
      },
      error: (err) => {
        alert('Band qilishda xatolik: ' + (err.error?.message || err.message));
      },
    });
  }
}
