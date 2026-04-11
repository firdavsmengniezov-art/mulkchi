import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { PropertyImage } from '../../../core/models';
import { LoggingService } from '../../../core/services/logging.service';
import { PropertyImageService } from '../../../core/services/property-image.service';
import { PropertyService } from '../../../core/services/property.service';
import { ImageUploaderComponent } from '../../../shared/components/image-uploader/image-uploader.component';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ImageUploaderComponent],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
})
export class PropertyFormComponent implements OnInit {
  isEditMode = false;
  propertyId: string | null = null;
  loading = false;
  saving = false;

  // Property form data
  property: any = {
    title: '',
    description: '',
    price: 0,
    address: '',
    city: '',
    region: '',
    propertyType: 'Apartment',
    listingType: 'Sale',
    area: 0,
    roomsCount: 1,
    bathroomsCount: 1,
    hasParking: false,
    hasFurniture: false,
    hasAirConditioning: false,
    hasHeating: false,
    yearBuilt: new Date().getFullYear(),
  };

  // Image management
  propertyImages: PropertyImage[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private propertyService: PropertyService,
    private propertyImageService: PropertyImageService,
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    this.checkEditMode();
    if (this.isEditMode && this.propertyId) {
      this.loadProperty();
      this.loadPropertyImages();
    }
  }

  private checkEditMode(): void {
    this.propertyId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEditMode = !!this.propertyId;
  }

  private loadProperty(): void {
    if (!this.propertyId) return;

    this.loading = true;
    this.propertyService.getProperty(this.propertyId).subscribe({
      next: (property: any) => {
        this.property = property;
        this.loading = false;
      },
      error: (error: any) => {
        this.logger.error('Error loading property:', error);
        alert('Failed to load property');
        this.loading = false;
      },
    });
  }

  private loadPropertyImages(): void {
    if (!this.propertyId) return;

    this.propertyImageService.getPropertyImages(this.propertyId).subscribe({
      next: (images: any) => {
        this.propertyImages = images;
      },
      error: (error: any) => {
        this.logger.error('Error loading images:', error);
      },
    });
  }

  onSubmit(): void {
    if (this.saving) return;

    this.saving = true;

    const payload = this.toCreateDto();

    const observable =
      this.isEditMode && this.propertyId
        ? this.propertyService.updateProperty(this.propertyId, payload)
        : this.propertyService.createProperty(payload);

    observable.subscribe({
      next: (response: any) => {
        const newPropertyId = this.isEditMode ? this.propertyId : response.id;

        if (!this.isEditMode) {
          // For new properties, set the propertyId for image upload
          this.propertyId = newPropertyId;
        }

        alert(
          this.isEditMode ? 'Property updated successfully!' : 'Property created successfully!',
        );
        this.saving = false;

        // Navigate to property detail or stay on form for image upload
        if (this.isEditMode) {
          this.router.navigate(['/properties', this.propertyId]);
        } else {
          // Stay on form for image upload
          alert('Property created! Now you can upload images.');
        }
      },
      error: (error: any) => {
        this.logger.error('Error saving property:', error);
        const message = error?.error?.message || error?.message || 'Unknown error';
        alert(`Failed to save property: ${message}`);
        this.saving = false;
      },
    });
  }

  private toCreateDto(): Record<string, any> {
    const region = this.mapRegionToBackend(this.property.region);
    const listingType = this.mapListingTypeToBackend(this.property.listingType);
    const normalizedPrice = Number(this.property.price) || 0;

    return {
      title: this.property.title,
      description: this.property.description,
      type: this.property.propertyType,
      category: 'Residential',
      status: 'Active',
      listingType,
      // Backend validation currently requires monthlyRent > 0 for creation.
      monthlyRent: normalizedPrice,
      salePrice: listingType === 'Sale' ? normalizedPrice : null,
      pricePerNight: listingType === 'ShortTermRent' ? normalizedPrice : null,
      securityDeposit: 0,
      area: Number(this.property.area) || 0,
      numberOfBedrooms: Number(this.property.roomsCount) || 1,
      numberOfBathrooms: Number(this.property.bathroomsCount) || 1,
      maxGuests: Math.max(Number(this.property.roomsCount) || 1, 1) * 2,
      region,
      city: this.property.city,
      district: this.property.city,
      address: this.property.address,
      mahalla: '',
      latitude: 0,
      longitude: 0,
      hasWifi: false,
      hasParking: !!this.property.hasParking,
      hasPool: false,
      petsAllowed: false,
      isInstantBook: false,
      isVacant: true,
      hasMetroNearby: false,
      hasBusStop: false,
      hasMarketNearby: false,
      hasSchoolNearby: false,
      hasHospitalNearby: false,
      distanceToCityCenter: 0,
      hasElevator: false,
      hasSecurity: false,
      hasGenerator: false,
      hasGas: false,
      hasFurniture: !!this.property.hasFurniture,
      isRenovated: false,
      hasAirConditioning: !!this.property.hasAirConditioning,
      hasHeating: !!this.property.hasHeating,
      hasWasher: false,
      hasKitchen: false,
      hasTV: false,
      hasWorkspace: false,
      isSelfCheckIn: false,
      isChildFriendly: false,
      isAccessible: false,
      currency: 'UZS',
      exchangeRate: 1,
    };
  }

  private mapRegionToBackend(region: string): string {
    const map: Record<string, string> = {
      Tashkent: 'ToshkentShahar',
      Samarkand: 'Samarqand',
      Bukhara: 'Buxoro',
      Andijan: 'Andijon',
      Fergana: 'Fargona',
      Namangan: 'Namangan',
      Khorezm: 'Xorazm',
      Karakalpakstan: 'Qoraqalpogiston',
      Navoiy: 'Navoiy',
      Jizzakh: 'Jizzax',
      Sirdaryo: 'Sirdaryo',
      Surxondaryo: 'Surxondaryo',
      Qashqadaryo: 'Qashqadaryo',
    };

    return map[region] || 'ToshkentShahar';
  }

  private mapListingTypeToBackend(listingType: string): string {
    if (listingType === 'ShortTermRent' || listingType === 'DailyRent') {
      return 'ShortTermRent';
    }

    return listingType === 'Sale' ? 'Sale' : 'Rent';
  }

  onImagesUploaded(images: PropertyImage[]): void {
    this.propertyImages = [...this.propertyImages, ...images];
    alert('Images uploaded successfully!');
  }

  onImageDeleted(imageId: string): void {
    this.propertyImages = this.propertyImages.filter((img) => img.id !== imageId);
    alert('Image deleted successfully!');
  }

  onPrimaryImageSet(imageId: string): void {
    // Update all images to set only one as primary
    this.propertyImages = this.propertyImages.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    alert('Primary image updated!');
  }

  onCancel(): void {
    if (this.isEditMode && this.propertyId) {
      this.router.navigate(['/properties', this.propertyId]);
    } else {
      this.router.navigate(['/properties']);
    }
  }

  // Form validation
  get isFormValid(): boolean {
    return !!(
      this.property.title &&
      this.property.description &&
      this.property.address &&
      this.property.city &&
      this.property.region &&
      this.property.price > 0 &&
      this.property.area > 0
    );
  }

  // Enum helpers
  get propertyTypes(): string[] {
    return ['Apartment', 'House', 'Villa', 'Commercial', 'Land', 'Studio'];
  }

  get listingTypes(): string[] {
    return ['Sale', 'Rent', 'ShortTermRent'];
  }

  get regions(): string[] {
    return [
      'Tashkent',
      'Samarkand',
      'Bukhara',
      'Fergana',
      'Andijan',
      'Namangan',
      'Khorezm',
      'Karakalpakstan',
    ];
  }

  // Current year for form validation
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
