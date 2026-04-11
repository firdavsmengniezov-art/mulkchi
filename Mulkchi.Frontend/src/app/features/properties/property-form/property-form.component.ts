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

/** 5-bosqichli mulk e'loni yaratish formasi */
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

  /** Joriy bosqich (0–4) */
  currentStep = 0;

  readonly steps = [
    { label: 'Asosiy ma\'lumotlar', icon: '📋' },
    { label: 'Parametrlar', icon: '📐' },
    { label: 'Narx va shartlar', icon: '💰' },
    { label: 'Manzil', icon: '📍' },
    { label: 'Rasmlar', icon: '🖼️' },
  ];

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
    hasWifi: false,
    hasPool: false,
    hasSecurity: false,
    hasElevator: false,
    hasGenerator: false,
    hasGas: false,
    hasWasher: false,
    hasKitchen: false,
    hasTV: false,
    hasWorkspace: false,
    petsAllowed: false,
    isChildFriendly: false,
    isAccessible: false,
    yearBuilt: new Date().getFullYear(),
    securityDeposit: 0,
    latitude: 0,
    longitude: 0,
    district: '',
    currency: 'UZS',
  };

  // Image management
  propertyImages: PropertyImage[] = [];

  constructor(
    public router: Router,
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

  // ─── Step navigation ─────────────────────────────────────────────────────

  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  get isMediaStep(): boolean {
    return this.currentStep === 4;
  }

  nextStep(): void {
    if (!this.isStepValid(this.currentStep)) return;
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(index: number): void {
    // Allow going back to any already-visited step or forward only if current is valid
    if (index < this.currentStep || this.isStepValid(this.currentStep)) {
      this.currentStep = index;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 0: // Basic Info
        return !!(this.property.title && this.property.description);
      case 1: // Parameters
        return this.property.area > 0 && this.property.roomsCount >= 1;
      case 2: // Price & Terms
        return this.property.price > 0;
      case 3: // Location
        return !!(this.property.address && this.property.city && this.property.region);
      case 4: // Media – always valid (images optional)
        return true;
      default:
        return false;
    }
  }

  isStepCompleted(step: number): boolean {
    return step < this.currentStep;
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.saving) return;
    if (!this.isFormValid) {
      alert('Iltimos, barcha majburiy maydonlarni to\'ldiring.');
      return;
    }

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
          this.propertyId = newPropertyId;
          // Advance to media step so user can upload images immediately
          this.currentStep = 4;
        }

        this.saving = false;

        if (this.isEditMode) {
          alert('Mulk muvaffaqiyatli yangilandi!');
          this.router.navigate(['/properties', this.propertyId]);
        } else {
          alert('Mulk yaratildi! Endi rasm yuklashingiz mumkin.');
        }
      },
      error: (error: any) => {
        this.logger.error('Error saving property:', error);
        const message = error?.error?.message || error?.message || 'Unknown error';
        alert(`Xatolik: ${message}`);
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
      monthlyRent: normalizedPrice,
      salePrice: listingType === 'Sale' ? normalizedPrice : null,
      pricePerNight: listingType === 'ShortTermRent' ? normalizedPrice : null,
      securityDeposit: Number(this.property.securityDeposit) || 0,
      area: Number(this.property.area) || 0,
      numberOfBedrooms: Number(this.property.roomsCount) || 1,
      numberOfBathrooms: Number(this.property.bathroomsCount) || 1,
      maxGuests: Math.max(Number(this.property.roomsCount) || 1, 1) * 2,
      region,
      city: this.property.city,
      district: this.property.district || this.property.city,
      address: this.property.address,
      mahalla: '',
      latitude: Number(this.property.latitude) || 0,
      longitude: Number(this.property.longitude) || 0,
      hasWifi: !!this.property.hasWifi,
      hasParking: !!this.property.hasParking,
      hasPool: !!this.property.hasPool,
      petsAllowed: !!this.property.petsAllowed,
      isInstantBook: false,
      isVacant: true,
      hasMetroNearby: false,
      hasBusStop: false,
      hasMarketNearby: false,
      hasSchoolNearby: false,
      hasHospitalNearby: false,
      distanceToCityCenter: 0,
      hasElevator: !!this.property.hasElevator,
      hasSecurity: !!this.property.hasSecurity,
      hasGenerator: !!this.property.hasGenerator,
      hasGas: !!this.property.hasGas,
      hasFurniture: !!this.property.hasFurniture,
      isRenovated: false,
      hasAirConditioning: !!this.property.hasAirConditioning,
      hasHeating: !!this.property.hasHeating,
      hasWasher: !!this.property.hasWasher,
      hasKitchen: !!this.property.hasKitchen,
      hasTV: !!this.property.hasTV,
      hasWorkspace: !!this.property.hasWorkspace,
      isSelfCheckIn: false,
      isChildFriendly: !!this.property.isChildFriendly,
      isAccessible: !!this.property.isAccessible,
      currency: this.property.currency || 'UZS',
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
  }

  onImageDeleted(imageId: string): void {
    this.propertyImages = this.propertyImages.filter((img) => img.id !== imageId);
  }

  onPrimaryImageSet(imageId: string): void {
    this.propertyImages = this.propertyImages.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
  }

  onCancel(): void {
    if (this.isEditMode && this.propertyId) {
      this.router.navigate(['/properties', this.propertyId]);
    } else {
      this.router.navigate(['/properties']);
    }
  }

  // Form validation – all steps must be valid
  get isFormValid(): boolean {
    return (
      this.isStepValid(0) &&
      this.isStepValid(1) &&
      this.isStepValid(2) &&
      this.isStepValid(3)
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
      'Navoiy',
      'Jizzakh',
      'Sirdaryo',
      'Surxondaryo',
      'Qashqadaryo',
    ];
  }

  get currencies(): string[] {
    return ['UZS', 'USD', 'EUR'];
  }

  // Current year for form validation
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
