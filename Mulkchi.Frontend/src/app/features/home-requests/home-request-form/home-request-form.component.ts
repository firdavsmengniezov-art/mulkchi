import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import {
  ContactMethod,
  CreateHomeRequestRequest,
  ListingType,
  PropertyType,
} from '../../../core/models';
import { HomeRequestService } from '../../../core/services/home-request.service';
import { LoggingService } from '../../../core/services/logging.service';

interface Step {
  id: number;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home-request-form.component.html',
  styleUrls: ['./home-request-form.component.scss'],
})
export class HomeRequestFormComponent implements OnInit {
  loading = false;
  submitted = false;
  error = '';
  
  // Step management
  currentStep = 0;
  totalSteps = 4;
  
  steps: Step[] = [
    { id: 0, label: 'Asosiy', icon: 'document' },
    { id: 1, label: 'Joylashuv', icon: 'location' },
    { id: 2, label: 'Byudjet', icon: 'currency' },
    { id: 3, label: 'Aloqa', icon: 'user' },
  ];

  // Form data
  formData: CreateHomeRequestRequest = {
    title: '',
    description: '',
    propertyType: PropertyType.Apartment,
    location: '',
    region: '',
    district: '',
    minPrice: undefined,
    maxPrice: undefined,
    minArea: undefined,
    maxArea: undefined,
    roomsCount: undefined,
    listingType: ListingType.Sale,
    contactInfo: {
      phone: '',
      email: '',
      preferredContactMethod: ContactMethod.Phone,
      additionalNotes: '',
    },
  };

  // Enums for template
  propertyTypes = Object.values(PropertyType);
  listingTypes = Object.values(ListingType);
  contactMethods = Object.values(ContactMethod);
  regions = [
    'Toshkent',
    'Samarqand',
    'Buxoro',
    'Farg\'ona',
    'Andijon',
    'Namangan',
    'Xorazm',
    'Qoraqalpog\'iston',
    'Navoiy',
    'Jizzax',
    'Sirdaryo',
    'Qashqadaryo',
    'Surxondaryo',
  ];

  constructor(
    private homeRequestService: HomeRequestService,
    public router: Router,
    private logger: LoggingService) {}

  ngOnInit(): void {
    // Initialize form
  }
  
  // Step navigation
  nextStep(): void {
    if (this.currentStep < this.totalSteps - 1 && this.isStepValid(this.currentStep)) {
      this.currentStep++;
      this.scrollToTop();
    }
  }
  
  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.scrollToTop();
    }
  }
  
  goToStep(stepIndex: number): void {
    // Only allow going to completed steps or current step
    if (stepIndex <= this.currentStep || this.canAccessStep(stepIndex)) {
      this.currentStep = stepIndex;
      this.scrollToTop();
    }
  }
  
  canAccessStep(stepIndex: number): boolean {
    // Check if all previous steps are valid
    for (let i = 0; i < stepIndex; i++) {
      if (!this.isStepValid(i)) {
        return false;
      }
    }
    return true;
  }
  
  isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0: // Basic info
        return !!(
          this.formData.title?.trim() &&
          this.formData.title.length >= 5 &&
          this.formData.description?.trim() &&
          this.formData.description.length >= 20 &&
          this.formData.propertyType &&
          this.formData.listingType
        );
      case 1: // Location
        return !!(
          this.formData.location?.trim() &&
          this.formData.region
        );
      case 2: // Budget (optional fields, always valid)
        return this.isBudgetValid() && this.isAreaValid();
      case 3: // Contact
        return !!(
          this.formData.contactInfo?.phone?.trim() &&
          this.formData.contactInfo?.email?.trim() &&
          this.isValidEmail(this.formData.contactInfo?.email || '') &&
          this.formData.contactInfo?.preferredContactMethod
        );
      default:
        return false;
    }
  }
  
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit(): void {
    if (this.loading || !this.isFormValid()) return;

    this.loading = true;
    this.error = '';

    this.homeRequestService.createHomeRequest(this.formData).subscribe({
      next: (request) => {
        this.submitted = true;
        this.loading = false;
        this.scrollToTop();
      },
      error: (err) => {
        this.error = 'So\'rovni yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';
        this.logger.error('Error creating home request:', err);
        this.loading = false;
      },
    });
  }

  resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      propertyType: PropertyType.Apartment,
      location: '',
      region: '',
      district: '',
      minPrice: undefined,
      maxPrice: undefined,
      minArea: undefined,
      maxArea: undefined,
      roomsCount: undefined,
      listingType: ListingType.Sale,
      contactInfo: {
        phone: '',
        email: '',
        preferredContactMethod: ContactMethod.Phone,
        additionalNotes: '',
      },
    };
    this.submitted = false;
    this.error = '';
    this.currentStep = 0;
  }

  // Form validation
  isFormValid(): boolean {
    return !!(
      this.formData.title?.trim() &&
      this.formData.description?.trim() &&
      this.formData.location?.trim() &&
      this.formData.region &&
      this.formData.contactInfo?.phone?.trim() &&
      this.formData.contactInfo?.email?.trim() &&
      this.isValidEmail(this.formData.contactInfo?.email || '')
    );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper methods for display
  getPropertyTypeLabel(type: PropertyType): string {
    const typeLabels: Record<string, string> = {
      [PropertyType.Apartment]: 'Kvartira',
      [PropertyType.House]: 'Hovli uy',
      [PropertyType.Office]: 'Ofis',
      [PropertyType.Commercial]: 'Tijorat binosi',
      [PropertyType.Land]: 'Yer uchastkasi',
    };
    return typeLabels[type as string] || type;
  }

  getListingTypeLabel(type: ListingType): string {
    const typeLabels: Record<string, string> = {
      [ListingType.Sale]: 'Sotib olish',
      [ListingType.Rent]: 'Uzoq muddatli ijara',
      [ListingType.DailyRent]: 'Kunlik ijara',
    };
    return typeLabels[type as string] || type;
  }

  getContactMethodLabel(method: ContactMethod): string {
    const methodLabels: Record<string, string> = {
      [ContactMethod.Phone]: 'Telefon',
      [ContactMethod.Email]: 'Email',
      [ContactMethod.Both]: 'Telefon va Email',
    };
    return methodLabels[method] || method;
  }

  // Price formatting
  formatPrice(value: number | null): string {
    if (!value) return '';
    return value.toLocaleString('uz-UZ');
  }

  // Character counters
  get titleCharCount(): number {
    return this.formData.title.length;
  }

  get descriptionCharCount(): number {
    return this.formData.description.length;
  }

  // Budget validation
  isBudgetValid(): boolean {
    if (this.formData.minPrice && this.formData.maxPrice) {
      return this.formData.minPrice <= this.formData.maxPrice;
    }
    return true;
  }

  // Area validation
  isAreaValid(): boolean {
    if (this.formData.minArea && this.formData.maxArea) {
      return this.formData.minArea <= this.formData.maxArea;
    }
    return true;
  }
}
