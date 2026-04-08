import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  ContactMethod,
  CreateHomeRequestRequest,
  ListingType,
  PropertyType,
} from '../../../core/models';
import { HomeRequestService } from '../../../core/services/home-request.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-home-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-request-form.component.html',
  styleUrls: ['./home-request-form.component.scss'],
})
export class HomeRequestFormComponent implements OnInit {
  loading = false;
  submitted = false;
  error = '';

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
    'Tashkent',
    'Samarkand',
    'Bukhara',
    'Fergana',
    'Andijan',
    'Namangan',
    'Khorezm',
    'Karakalpakstan',
  ];

  constructor(
    private homeRequestService: HomeRequestService,
    public router: Router,
    private logger: LoggingService) {}

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loading || !this.isFormValid()) return;

    this.loading = true;
    this.error = '';

    this.homeRequestService.createHomeRequest(this.formData).subscribe({
      next: (request) => {
        this.submitted = true;
        this.loading = false;

        // Scroll to success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.error = 'Failed to submit home request. Please try again.';
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
      [PropertyType.Apartment]: 'Apartment',
      [PropertyType.House]: 'House',
      [PropertyType.Office]: 'Office',
      [PropertyType.Commercial]: 'Commercial',
      [PropertyType.Land]: 'Land',
    };
    return typeLabels[type as string] || type;
  }

  getListingTypeLabel(type: ListingType): string {
    const typeLabels: Record<string, string> = {
      [ListingType.Sale]: 'For Sale',
      [ListingType.Rent]: 'For Rent',
      [ListingType.DailyRent]: 'Daily Rent',
    };
    return typeLabels[type as string] || type;
  }

  getContactMethodLabel(method: ContactMethod): string {
    const methodLabels: Record<string, string> = {
      [ContactMethod.Phone]: 'Phone',
      [ContactMethod.Email]: 'Email',
      [ContactMethod.Both]: 'Both',
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
