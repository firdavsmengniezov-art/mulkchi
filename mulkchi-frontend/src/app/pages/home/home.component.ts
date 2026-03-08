import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { Property, ListingType, PropertyType, PropertyCategory, PropertyStatus, UzbekistanRegion } from '../../core/models/property.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PropertyCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly router = inject(Router);

  searchLocation = '';
  searchType = '';
  searchPurpose = '';
  searchRooms = '';

  sampleProperties: Property[] = [
    {
      id: '1',
      title: 'Zamonaviy 3 xonali kvartira',
      description: 'Yangilangan, mebelli, barcha qulayliklar bilan jihozlangan.',
      type: PropertyType.Apartment,
      category: PropertyCategory.Residential,
      status: PropertyStatus.Active,
      listingType: ListingType.Rent,
      monthlyRent: 4500000,
      area: 85,
      numberOfBedrooms: 3,
      numberOfBathrooms: 1,
      maxGuests: 6,
      region: UzbekistanRegion.ToshkentShahar,
      city: 'Toshkent',
      district: 'Yunusobod',
      address: 'Yunusobod tumani, 9-mavze',
      hasWifi: true,
      hasParking: true,
      hasPool: false,
      petsAllowed: false,
      isInstantBook: true,
      isVacant: true,
      isFeatured: true,
      isVerified: true,
      hasMetroNearby: true,
      hasBusStop: true,
      hasMarketNearby: true,
      hasSchoolNearby: true,
      hasHospitalNearby: false,
      distanceToCityCenter: 3.5,
      hasElevator: true,
      hasSecurity: true,
      hasGenerator: false,
      hasGas: true,
      hasFurniture: true,
      isRenovated: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasWasher: true,
      hasKitchen: true,
      hasTV: true,
      hasWorkspace: false,
      isSelfCheckIn: false,
      isChildFriendly: true,
      isAccessible: false,
      averageRating: 4.8,
      viewsCount: 234,
      favoritesCount: 18,
      hostId: 'host1',
      createdDate: '2024-01-15T00:00:00Z',
      updatedDate: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      title: 'Premium villa Samarqandda',
      description: 'Hashamatli villa, hovli va basseyn bilan.',
      type: PropertyType.Villa,
      category: PropertyCategory.Residential,
      status: PropertyStatus.Active,
      listingType: ListingType.Sale,
      salePrice: 450000000,
      area: 350,
      numberOfBedrooms: 5,
      numberOfBathrooms: 3,
      maxGuests: 12,
      region: UzbekistanRegion.Samarqand,
      city: 'Samarqand',
      district: 'Markaz',
      address: 'Registon ko\'chasi, 15',
      hasWifi: true,
      hasParking: true,
      hasPool: true,
      petsAllowed: true,
      isInstantBook: false,
      isVacant: true,
      isFeatured: true,
      isVerified: true,
      hasMetroNearby: false,
      hasBusStop: true,
      hasMarketNearby: true,
      hasSchoolNearby: false,
      hasHospitalNearby: false,
      distanceToCityCenter: 1.2,
      hasElevator: false,
      hasSecurity: true,
      hasGenerator: true,
      hasGas: true,
      hasFurniture: true,
      isRenovated: true,
      hasAirConditioning: true,
      hasHeating: true,
      hasWasher: true,
      hasKitchen: true,
      hasTV: true,
      hasWorkspace: true,
      isSelfCheckIn: true,
      isChildFriendly: true,
      isAccessible: true,
      averageRating: 4.9,
      viewsCount: 589,
      favoritesCount: 47,
      hostId: 'host2',
      createdDate: '2024-02-01T00:00:00Z',
      updatedDate: '2024-02-01T00:00:00Z'
    },
    {
      id: '3',
      title: 'Qulay 2 xonali Chilonzorda',
      description: 'Metro yaqin, barcha transport turlari mavjud.',
      type: PropertyType.Apartment,
      category: PropertyCategory.Residential,
      status: PropertyStatus.Active,
      listingType: ListingType.Rent,
      monthlyRent: 2800000,
      area: 55,
      numberOfBedrooms: 2,
      numberOfBathrooms: 1,
      maxGuests: 4,
      region: UzbekistanRegion.ToshkentShahar,
      city: 'Toshkent',
      district: 'Chilonzor',
      address: 'Chilonzor tumani, 12-kvartal',
      hasWifi: true,
      hasParking: false,
      hasPool: false,
      petsAllowed: false,
      isInstantBook: true,
      isVacant: true,
      isFeatured: false,
      isVerified: true,
      hasMetroNearby: true,
      hasBusStop: true,
      hasMarketNearby: true,
      hasSchoolNearby: true,
      hasHospitalNearby: true,
      distanceToCityCenter: 5.0,
      hasElevator: true,
      hasSecurity: false,
      hasGenerator: false,
      hasGas: true,
      hasFurniture: true,
      isRenovated: false,
      hasAirConditioning: true,
      hasHeating: true,
      hasWasher: false,
      hasKitchen: true,
      hasTV: true,
      hasWorkspace: false,
      isSelfCheckIn: false,
      isChildFriendly: true,
      isAccessible: false,
      averageRating: 4.5,
      viewsCount: 156,
      favoritesCount: 9,
      hostId: 'host3',
      createdDate: '2024-03-01T00:00:00Z',
      updatedDate: '2024-03-01T00:00:00Z'
    }
  ];

  features = [
    { icon: '🔐', title: 'Xavfsiz bitimlar', desc: 'Barcha to\'lovlar xavfsiz tizim orqali amalga oshiriladi' },
    { icon: '💬', title: 'Real-time chat', desc: 'Mulkdor bilan bevosita muloqot qiling' },
    { icon: '🤖', title: 'AI tavsiyalar', desc: 'Sizning ehtiyojlaringizga mos mulklarni topamiz' },
    { icon: '🗺️', title: 'Xaritada qidirish', desc: 'Interaktiv xaritada kerakli hududni tanlang' }
  ];

  onSearch(): void {
    const queryParams: Record<string, string> = {};
    if (this.searchLocation) queryParams['city'] = this.searchLocation;
    if (this.searchType) queryParams['type'] = this.searchType;
    if (this.searchPurpose) queryParams['listingType'] = this.searchPurpose;
    if (this.searchRooms) queryParams['bedrooms'] = this.searchRooms;
    this.router.navigate(['/properties'], { queryParams });
  }
}
