import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CreateDiscountRequest,
  DiscountType,
  UpdateDiscountRequest,
} from '../../../../core/models';
import { DiscountService } from '../../../../core/services/discount.service';
import { LoggingService } from '../../../../core/services/logging.service';

@Component({
  selector: 'app-discount-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discount-form.component.html',
  styleUrls: ['./discount-form.component.scss'],
})
export class DiscountFormComponent implements OnInit {
  isEditMode = false;
  discountId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  // Form data
  formData: CreateDiscountRequest = {
    code: '',
    description: '',
    discountType: DiscountType.Percentage,
    discountValue: 0,
    minBookingAmount: undefined,
    maxDiscountAmount: undefined,
    minBookingDays: undefined,
    maxUsageCount: undefined,
    validFrom: '',
    validUntil: '',
    applicablePropertyTypes: [],
    applicableListingTypes: [],
  };

  // Enums for template
  discountTypes = Object.values(DiscountType);
  propertyTypes = ['Apartment', 'House', 'Villa', 'Commercial', 'Land', 'Studio'];
  listingTypes = ['Sale', 'Rent', 'ShortTermRent'];

  constructor(
    private discountService: DiscountService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.checkEditMode();
    if (this.isEditMode && this.discountId) {
      this.loadDiscount();
    } else {
      // Set default dates for new discount
      this.setDefaultDates();
    }
  }

  private checkEditMode(): void {
    this.discountId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEditMode = this.discountId !== 'new' && !!this.discountId;
  }

  private loadDiscount(): void {
    if (!this.discountId) return;

    this.loading = true;
    this.error = '';

    this.discountService.getDiscountById(this.discountId).subscribe({
      next: (discount) => {
        this.formData = {
          code: discount.code,
          description: discount.description,
          discountType: discount.discountType,
          discountValue: discount.discountValue,
          minBookingAmount: discount.minBookingAmount,
          maxDiscountAmount: discount.maxDiscountAmount,
          minBookingDays: discount.minBookingDays,
          maxUsageCount: discount.maxUsageCount,
          validFrom: new Date(discount.validFrom).toISOString().slice(0, 16),
          validUntil: new Date(discount.validUntil).toISOString().slice(0, 16),
          applicablePropertyTypes: discount.applicablePropertyTypes || [],
          applicableListingTypes: discount.applicableListingTypes || [],
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load discount';
        this.logger.error('Error loading discount:', err);
        this.loading = false;
      },
    });
  }

  private setDefaultDates(): void {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    this.formData.validFrom = now.toISOString().slice(0, 16);
    this.formData.validUntil = futureDate.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.saving || !this.isFormValid()) return;

    this.saving = true;
    this.error = '';

    const observable =
      this.isEditMode && this.discountId
        ? this.discountService.updateDiscount({
            id: this.discountId,
            ...this.formData,
          } as UpdateDiscountRequest)
        : this.discountService.createDiscount(this.formData);

    observable.subscribe({
      next: (discount) => {
        const successMessage = this.isEditMode
          ? 'Discount updated successfully!'
          : 'Discount created successfully!';

        alert(successMessage);
        this.saving = false;
        this.router.navigate(['/admin/discounts']);
      },
      error: (err) => {
        this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} discount`;
        this.logger.error('Error saving discount:', err);
        this.saving = false;
      },
    });
  }

  onCancel(): void {
    this.location.back();
  }

  // Form validation
  isFormValid(): boolean {
    return !!(
      this.formData.code.trim() &&
      this.formData.description.trim() &&
      this.formData.discountType &&
      this.formData.discountValue > 0 &&
      this.formData.validFrom &&
      this.formData.validUntil &&
      this.areDatesValid() &&
      this.isDiscountValueValid()
    );
  }

  areDatesValid(): boolean {
    if (!this.formData.validFrom || !this.formData.validUntil) return false;
    return new Date(this.formData.validFrom) < new Date(this.formData.validUntil);
  }

  isDiscountValueValid(): boolean {
    if (this.formData.discountType === DiscountType.Percentage) {
      return this.formData.discountValue > 0 && this.formData.discountValue <= 100;
    }
    return this.formData.discountValue > 0;
  }

  // Auto-format discount code
  onCodeChange(): void {
    this.formData.code = this.formData.code.toUpperCase().replace(/\s/g, '');
  }

  // Generate random code
  generateCode(): void {
    this.formData.code = this.discountService.generateDiscountCode();
  }

  // Helper methods for display
  getDiscountTypeLabel(type: DiscountType): string {
    return type === DiscountType.Percentage ? 'Percentage' : 'Fixed Amount';
  }

  // Character counters
  get codeCharCount(): number {
    return this.formData.code.length;
  }

  get descriptionCharCount(): number {
    return this.formData.description.length;
  }

  // Date helpers
  get minEndDate(): string {
    return this.formData.validFrom;
  }

  get minStartDate(): string {
    return new Date().toISOString().slice(0, 16);
  }

  // Array helpers for multi-select
  togglePropertyType(type: string): void {
    const index = this.formData.applicablePropertyTypes!.indexOf(type);
    if (index > -1) {
      this.formData.applicablePropertyTypes!.splice(index, 1);
    } else {
      this.formData.applicablePropertyTypes!.push(type);
    }
  }

  toggleListingType(type: string): void {
    const index = this.formData.applicableListingTypes!.indexOf(type);
    if (index > -1) {
      this.formData.applicableListingTypes!.splice(index, 1);
    } else {
      this.formData.applicableListingTypes!.push(type);
    }
  }

  isPropertyTypeSelected(type: string): boolean {
    return this.formData.applicablePropertyTypes!.includes(type);
  }

  isListingTypeSelected(type: string): boolean {
    return this.formData.applicableListingTypes!.includes(type);
  }

  // Clear applicability (apply to all)
  clearPropertyTypes(): void {
    this.formData.applicablePropertyTypes = [];
  }

  clearListingTypes(): void {
    this.formData.applicableListingTypes = [];
  }

  // Validation helpers
  get codeError(): string {
    if (!this.formData.code.trim()) return 'Code is required';
    if (this.formData.code.length < 3) return 'Code must be at least 3 characters';
    if (this.formData.code.length > 20) return 'Code must be less than 20 characters';
    if (!/^[A-Z0-9]+$/.test(this.formData.code))
      return 'Code must contain only letters and numbers';
    return '';
  }

  get valueError(): string {
    if (this.formData.discountValue <= 0) return 'Value must be greater than 0';
    if (
      this.formData.discountType === DiscountType.Percentage &&
      this.formData.discountValue > 100
    ) {
      return 'Percentage cannot exceed 100%';
    }
    return '';
  }

  get dateError(): string {
    if (!this.areDatesValid()) return 'End date must be after start date';
    return '';
  }

  get minBookingAmountError(): string {
    if (this.formData.minBookingAmount && this.formData.maxDiscountAmount) {
      if (this.formData.minBookingAmount <= this.formData.maxDiscountAmount) {
        return 'Minimum booking amount must be greater than maximum discount amount';
      }
    }
    return '';
  }
}
