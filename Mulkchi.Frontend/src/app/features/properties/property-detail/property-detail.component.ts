import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FavoriteButtonComponent } from '../../../shared/components/favorite-button/favorite-button.component';
import { ReviewsListComponent } from '../../../features/reviews/reviews-list/reviews-list.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, FavoriteButtonComponent, ReviewsListComponent, TranslateModule],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  property: any = null;
  loading = true;
  // Booking form
  checkIn = ''; 
  checkOut = '';
  guests = 1;
  bookingLoading = false;
  bookingSuccess = false;
  bookingError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/properties']); return; }
    
    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.property = {
        id: id,
        title: 'Luxury Apartment in Tashkent Center',
        city: 'Toshkent',
        district: 'Mirabad',
        region: 'Toshkent',
        address: 'Amir Temur street, 45',
        type: 'Apartment',
        listingType: 'Rent',
        monthlyRent: 800,
        area: 120,
        numberOfBedrooms: 3,
        numberOfBathrooms: 2,
        maxGuests: 6,
        averageRating: 4.8,
        viewsCount: 245,
        description: 'Modern luxury apartment in the heart of Tashkent with all amenities. Perfect for families and business travelers.',
        hasWifi: true,
        hasParking: true,
        hasPool: false,
        hasElevator: true,
        hasAirConditioning: true,
        hasHeating: true,
        hasBalcony: true,
        hasGarden: false,
        hasSecurity: true,
        hasMetroNearby: true,
        isRenovated: true,
        isPetFriendly: false
      };
      this.loading = false;
    }, 1000);
  }

  getImage(): string {
    if (this.property?.images?.length) return this.property.images[0].url;
    const photos: any = {
      'Apartment': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      'House': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'Office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
    };
    return photos[this.property?.type || ''] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  }

  getPrice(): string {
    if (!this.property) return '';
    if (this.property.listingType === 'Rent') return `$${this.property.monthlyRent}/oy`;
    if (this.property.listingType === 'DailyRent') return `$${this.property.pricePerNight}/kun`;
    return `$${this.property.salePrice?.toLocaleString()}`;
  }

  getAmenities(): string[] {
    if (!this.property) return [];
    const list = [];
    if (this.property.hasWifi) list.push(' Wi-Fi');
    if (this.property.hasParking) list.push(' Parking');
    if (this.property.hasPool) list.push(' Basseyn');
    if (this.property.hasElevator) list.push(' Lift');
    if (this.property.hasAirConditioning) list.push(' Konditsioner');
    if (this.property.hasHeating) list.push(' Isitish');
    if (this.property.hasBalcony) list.push(' Balkon');
    if (this.property.hasGarden) list.push(' Bog\'');
    if (this.property.hasSecurity) list.push(' Xavfsizlik');
    if (this.property.hasMetroNearby) list.push(' Metro yaqin');
    if (this.property.isRenovated) list.push(' Ta\'mirlangan');
    if (this.property.isPetFriendly) list.push(' Hayvonlarga ruxsat');
    return list;
  }

  book() {
    if (!this.checkIn || !this.checkOut) {
      this.bookingError = 'Sana va mehmonlar sonini kiriting';
      return;
    }
    this.bookingLoading = true;
    this.bookingError = '';
    
    // Simulate booking - replace with actual service call
    setTimeout(() => {
      this.bookingLoading = false;
      this.bookingSuccess = true;
    }, 1000);
  }

  goToChat() {
    // Get property owner ID (mock data - replace with actual property.ownerId)
    const ownerId = this.property?.ownerId || 'mock-owner-id';
    this.router.navigate(['/chat', ownerId]);
  }

  goBack() {
    this.location.back();
  }
}
