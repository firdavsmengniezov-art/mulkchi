import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { animate, style, transition, trigger } from '@angular/animations';

import { PropertyImage } from '../../../core/models';
import { PropertyService } from '../../../core/services/property.service';
import { LoggingService } from '../../../core/services/logging.service';
import { PropertyImageService } from '../../../core/services/property-image.service';
import { ImageUploaderComponent } from '../../../shared/components/image-uploader/image-uploader.component';

/** 5-bosqichli mulk e'loni yaratish formasi */
@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatStepperModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ImageUploaderComponent
  ],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
  animations: [
    trigger('stepTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-20px)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class PropertyFormComponent implements OnInit {
  // Dependency injection
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private propertyService = inject(PropertyService);
  private propertyImageService = inject(PropertyImageService);
  private logger = inject(LoggingService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // Signals for reactive state
  readonly isEditMode = signal(false);
  readonly propertyId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly currentStep = signal(0);
  readonly propertyImages = signal<PropertyImage[]>([]);
  readonly uploadProgress = signal<number>(0);

  // Form groups for each step
  basicInfoForm!: FormGroup;
  parametersForm!: FormGroup;
  pricingForm!: FormGroup;
  locationForm!: FormGroup;

  readonly steps = [
    { label: 'Asosiy ma\'lumotlar', icon: 'description', description: 'Sarlavha va tavsif' },
    { label: 'Parametrlar', icon: 'square_foot', description: 'Maydon va xonalar' },
    { label: 'Narx va shartlar', icon: 'payments', description: 'Narx va to\'lov' },
    { label: 'Manzil', icon: 'location_on', description: 'Joylashuv' },
    { label: 'Rasmlar', icon: 'photo_library', description: 'Mulk rasmlari' },
  ];

  // Computed values
  readonly progressPercentage = computed(() => {
    const step = this.currentStep();
    const totalSteps = this.steps.length;
    return ((step + 1) / totalSteps) * 100;
  });

  readonly isFirstStep = computed(() => this.currentStep() === 0);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length - 1);

  constructor() {}

  ngOnInit(): void {
    this.initializeForms();
    this.checkEditMode();
    
    if (this.isEditMode() && this.propertyId()) {
      this.loadProperty();
      this.loadPropertyImages();
    }
  }

  private initializeForms(): void {
    // Step 1: Basic Info
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(2000)]],
      propertyType: ['Apartment', Validators.required],
      listingType: ['Sale', Validators.required]
    });

    // Step 2: Parameters
    this.parametersForm = this.fb.group({
      area: [0, [Validators.required, Validators.min(1)]],
      roomsCount: [1, [Validators.required, Validators.min(1)]],
      bathroomsCount: [1, [Validators.required, Validators.min(1)]],
      hasParking: [false],
      hasFurniture: [false],
      hasAirConditioning: [false],
      hasHeating: [false],
      hasWifi: [false],
      hasPool: [false],
      hasSecurity: [false],
      hasElevator: [false],
      hasGenerator: [false],
      hasGas: [false],
      hasWasher: [false],
      hasKitchen: [false],
      hasTV: [false],
      hasWorkspace: [false],
      petsAllowed: [false],
      isChildFriendly: [false],
      isAccessible: [false]
    });

    // Step 3: Pricing
    this.pricingForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(1)]],
      currency: ['UZS', Validators.required],
      securityDeposit: [0],
      yearBuilt: [new Date().getFullYear(), [Validators.min(1900), Validators.max(new Date().getFullYear())]]
    });

    // Step 4: Location
    this.locationForm = this.fb.group({
      region: ['', Validators.required],
      city: ['', Validators.required],
      district: [''],
      address: ['', [Validators.required, Validators.minLength(5)]],
      latitude: [0],
      longitude: [0]
    });
  }

  private checkEditMode(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.propertyId.set(id);
    this.isEditMode.set(!!id);
  }

  private loadProperty(): void {
    const id = this.propertyId();
    if (!id) return;

    this.loading.set(true);
    this.propertyService.getProperty(id).subscribe({
      next: (property: any) => {
        this.patchFormValues(property);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.logger.error('Error loading property:', error);
        this.snackBar.open('Mulk ma\'lumotlarini yuklashda xatolik', 'Yopish', { duration: 3000 });
        this.loading.set(false);
      },
    });
  }

  private loadPropertyImages(): void {
    const id = this.propertyId();
    if (!id) return;

    this.propertyImageService.getPropertyImages(id).subscribe({
      next: (images: any) => {
        this.propertyImages.set(images);
      },
      error: (error: any) => {
        this.logger.error('Error loading images:', error);
      },
    });
  }

  private patchFormValues(property: any): void {
    this.basicInfoForm.patchValue({
      title: property.title,
      description: property.description,
      propertyType: property.type,
      listingType: property.listingType
    });

    this.parametersForm.patchValue({
      area: property.area,
      roomsCount: property.numberOfBedrooms,
      bathroomsCount: property.numberOfBathrooms,
      hasParking: property.hasParking,
      hasFurniture: property.hasFurniture,
      hasAirConditioning: property.hasAirConditioning,
      hasHeating: property.hasHeating,
      hasWifi: property.hasWifi,
      hasPool: property.hasPool,
      hasSecurity: property.hasSecurity,
      hasElevator: property.hasElevator,
      hasGenerator: property.hasGenerator,
      hasGas: property.hasGas,
      hasWasher: property.hasWasher,
      hasKitchen: property.hasKitchen,
      hasTV: property.hasTV,
      hasWorkspace: property.hasWorkspace,
      petsAllowed: property.petsAllowed,
      isChildFriendly: property.isChildFriendly,
      isAccessible: property.isAccessible
    });

    this.pricingForm.patchValue({
      price: property.salePrice || property.monthlyRent || 0,
      currency: property.currency || 'UZS',
      securityDeposit: property.securityDeposit || 0
    });

    this.locationForm.patchValue({
      region: property.region,
      city: property.city,
      district: property.district,
      address: property.address,
      latitude: property.latitude || 0,
      longitude: property.longitude || 0
    });
  }

  // ─── Step navigation ─────────────────────────────────────────────────────

  readonly isMediaStep = computed(() => this.currentStep() === 4);

  getCurrentForm(): FormGroup {
    switch (this.currentStep()) {
      case 0: return this.basicInfoForm;
      case 1: return this.parametersForm;
      case 2: return this.pricingForm;
      case 3: return this.locationForm;
      default: return this.basicInfoForm;
    }
  }

  nextStep(): void {
    const currentForm = this.getCurrentForm();
    if (currentForm.invalid) {
      currentForm.markAllAsTouched();
      this.snackBar.open('Iltimos, barcha majburiy maydonlarni to\'ldiring', 'Yopish', { duration: 3000 });
      return;
    }
    
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  goToStep(index: number): void {
    // Allow going back to any already-visited step
    if (index < this.currentStep()) {
      this.currentStep.set(index);
      return;
    }
    
    // For going forward, validate all previous steps
    for (let i = 0; i < index; i++) {
      if (!this.isStepValid(i)) {
        this.snackBar.open(`Avval ${this.steps[i].label} ni to'ldiring`, 'Yopish', { duration: 3000 });
        return;
      }
    }
    this.currentStep.set(index);
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 0: return this.basicInfoForm.valid;
      case 1: return this.parametersForm.valid;
      case 2: return this.pricingForm.valid;
      case 3: return this.locationForm.valid;
      case 4: return true; // Media is optional
      default: return false;
    }
  }

  isStepCompleted(step: number): boolean {
    return step < this.currentStep();
  }

  getStepErrorMessage(step: number): string {
    const form = this.getFormByStep(step);
    if (form.valid) return '';
    
    const errors: string[] = [];
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control?.invalid) {
        if (control.hasError('required')) errors.push(`${key} majburiy`);
        if (control.hasError('minlength')) errors.push(`${key} juda qisqa`);
        if (control.hasError('maxlength')) errors.push(`${key} juda uzun`);
        if (control.hasError('min')) errors.push(`${key} qiymati juda kichik`);
      }
    });
    return errors.join(', ');
  }

  private getFormByStep(step: number): FormGroup {
    switch (step) {
      case 0: return this.basicInfoForm;
      case 1: return this.parametersForm;
      case 2: return this.pricingForm;
      case 3: return this.locationForm;
      default: return this.basicInfoForm;
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.saving()) return;
    
    // Validate all forms
    if (!this.isFormValid()) {
      this.snackBar.open('Iltimos, barcha majburiy maydonlarni to\'ldiring', 'Yopish', { duration: 5000 });
      return;
    }

    this.saving.set(true);

    const payload = this.toCreateDto();
    const isEdit = this.isEditMode();
    const id = this.propertyId();

    const observable = isEdit && id
      ? this.propertyService.updateProperty(id, payload)
      : this.propertyService.createProperty(payload);

    observable.subscribe({
      next: (response: any) => {
        const newPropertyId = isEdit ? id : response.id;

        if (!isEdit && newPropertyId) {
          this.propertyId.set(newPropertyId);
          // Advance to media step so user can upload images immediately
          this.currentStep.set(4);
          this.snackBar.open('Mulk yaratildi! Endi rasm yuklashingiz mumkin.', 'OK', { duration: 5000 });
        } else {
          this.snackBar.open('Mulk muvaffaqiyatli yangilandi!', 'OK', { duration: 3000 });
          this.router.navigate(['/properties', newPropertyId]);
        }

        this.saving.set(false);
      },
      error: (error: any) => {
        this.logger.error('Error saving property:', error);
        const message = error?.error?.message || error?.message || 'Unknown error';
        this.snackBar.open(`Xatolik: ${message}`, 'Yopish', { duration: 5000 });
        this.saving.set(false);
      },
    });
  }

  private toCreateDto(): Record<string, any> {
    const basicInfo = this.basicInfoForm.value;
    const parameters = this.parametersForm.value;
    const pricing = this.pricingForm.value;
    const location = this.locationForm.value;

    const region = this.mapRegionToBackend(location.region);
    const listingType = this.mapListingTypeToBackend(basicInfo.listingType);
    const normalizedPrice = Number(pricing.price) || 0;

    return {
      title: basicInfo.title,
      description: basicInfo.description,
      type: basicInfo.propertyType,
      category: 'Residential',
      status: 'Active',
      listingType,
      monthlyRent: listingType !== 'Sale' ? normalizedPrice : null,
      salePrice: listingType === 'Sale' ? normalizedPrice : null,
      pricePerNight: listingType === 'ShortTermRent' ? normalizedPrice : null,
      securityDeposit: Number(pricing.securityDeposit) || 0,
      area: Number(parameters.area) || 0,
      numberOfBedrooms: Number(parameters.roomsCount) || 1,
      numberOfBathrooms: Number(parameters.bathroomsCount) || 1,
      maxGuests: Math.max(Number(parameters.roomsCount) || 1, 1) * 2,
      region,
      city: location.city,
      district: location.district || location.city,
      address: location.address,
      mahalla: '',
      latitude: Number(location.latitude) || 0,
      longitude: Number(location.longitude) || 0,
      hasWifi: !!parameters.hasWifi,
      hasParking: !!parameters.hasParking,
      hasPool: !!parameters.hasPool,
      petsAllowed: !!parameters.petsAllowed,
      isInstantBook: false,
      isVacant: true,
      hasMetroNearby: false,
      hasBusStop: false,
      hasMarketNearby: false,
      hasSchoolNearby: false,
      hasHospitalNearby: false,
      distanceToCityCenter: 0,
      hasElevator: !!parameters.hasElevator,
      hasSecurity: !!parameters.hasSecurity,
      hasGenerator: !!parameters.hasGenerator,
      hasGas: !!parameters.hasGas,
      hasFurniture: !!parameters.hasFurniture,
      isRenovated: false,
      hasAirConditioning: !!parameters.hasAirConditioning,
      hasHeating: !!parameters.hasHeating,
      hasWasher: !!parameters.hasWasher,
      hasKitchen: !!parameters.hasKitchen,
      hasTV: !!parameters.hasTV,
      hasWorkspace: !!parameters.hasWorkspace,
      isSelfCheckIn: false,
      isChildFriendly: !!parameters.isChildFriendly,
      isAccessible: !!parameters.isAccessible,
      currency: pricing.currency || 'UZS',
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
    this.propertyImages.update(current => [...current, ...images]);
  }

  onImageDeleted(imageId: string): void {
    this.propertyImages.update(current => current.filter(img => img.id !== imageId));
  }

  onPrimaryImageSet(imageId: string): void {
    this.propertyImages.update(current => current.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })));
  }

  onCancel(): void {
    if (this.isEditMode() && this.propertyId()) {
      this.router.navigate(['/properties', this.propertyId()]);
    } else {
      this.router.navigate(['/properties']);
    }
  }

  // Form validation – all steps must be valid
  isFormValid(): boolean {
    return (
      this.basicInfoForm.valid &&
      this.parametersForm.valid &&
      this.pricingForm.valid &&
      this.locationForm.valid
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
      'Tashkent', 'Samarkand', 'Bukhara', 'Fergana', 'Andijan',
      'Namangan', 'Khorezm', 'Karakalpakstan', 'Navoiy', 'Jizzakh',
      'Sirdaryo', 'Surxondaryo', 'Qashqadaryo'
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
