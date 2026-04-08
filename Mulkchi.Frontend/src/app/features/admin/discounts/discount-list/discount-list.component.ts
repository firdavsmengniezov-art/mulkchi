import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Discount, DiscountType } from '../../../../core/models';
import { DiscountUsageService } from '../../../../core/services/discount-usage.service';
import { DiscountService } from '../../../../core/services/discount.service';
import { LoggingService } from '../../../../core/services/logging.service';

@Component({
  selector: 'app-discount-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './discount-list.component.html',
  styleUrls: ['./discount-list.component.scss'],
})
export class DiscountListComponent implements OnInit {
  discounts: Discount[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedStatus: string = '';
  selectedType: string = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  // Enums for template
  discountTypes = Object.values(DiscountType);

  Math = Math;

  constructor(
    public discountService: DiscountService,
    private discountUsageService: DiscountUsageService,
    private router: Router,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.loadDiscounts();
  }

  loadDiscounts(): void {
    this.loading = true;
    this.error = '';

    this.discountService.getDiscounts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.discounts = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load discounts';
        this.logger.error('Error loading discounts:', err);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadDiscounts();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadDiscounts();
  }

  toggleDiscountStatus(discount: Discount): void {
    const newStatus = !discount.isActive;

    this.discountService.toggleDiscountStatus(discount.id, newStatus).subscribe({
      next: (updatedDiscount) => {
        const index = this.discounts.findIndex((d) => d.id === discount.id);
        if (index !== -1) {
          this.discounts[index] = updatedDiscount;
        }
      },
      error: (err) => {
        this.logger.error('Error toggling discount status:', err);
        alert('Failed to update discount status');
      },
    });
  }

  deleteDiscount(discount: Discount): void {
    if (
      confirm(`Are you sure you want to delete "${discount.code}"? This action cannot be undone.`)
    ) {
      this.discountService.deleteDiscount(discount.id).subscribe({
        next: () => {
          this.discounts = this.discounts.filter((d) => d.id !== discount.id);
          this.totalCount--;
        },
        error: (err) => {
          this.logger.error('Error deleting discount:', err);
          alert('Failed to delete discount');
        },
      });
    }
  }

  editDiscount(discount: Discount): void {
    this.router.navigate(['/admin/discounts', discount.id, 'edit']);
  }

  createDiscount(): void {
    this.router.navigate(['/admin/discounts', 'new']);
  }

  viewUsageStats(discount: Discount): void {
    this.router.navigate(['/admin/discounts', discount.id, 'usage']);
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDiscounts();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  // Helper methods for display
  getTypeLabel(type: DiscountType): string {
    return type === DiscountType.Percentage ? 'Percentage' : 'Fixed Amount';
  }

  getTypeColor(type: DiscountType): string {
    return type === DiscountType.Percentage
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  }

  getStatusColor(discount: Discount): string {
    const status = this.discountService.getDiscountStatus(discount);
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Disabled':
        return 'bg-gray-100 text-gray-800';
      case 'Usage Limit Reached':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDiscountValue(discount: Discount): string {
    if (discount.discountType === DiscountType.Percentage) {
      return `${discount.discountValue}%`;
    } else {
      return `UZS ${discount.discountValue.toLocaleString('uz-UZ')}`;
    }
  }

  formatCurrency(amount: number): string {
    return `UZS ${amount.toLocaleString('uz-UZ')}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uz-UZ');
  }

  getUsageProgress(discount: Discount): number {
    if (!discount.maxUsageCount) return 0;
    return (discount.currentUsageCount / discount.maxUsageCount) * 100;
  }

  getUsageProgressColor(discount: Discount): string {
    const progress = this.getUsageProgress(discount);
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  }

  get filteredDiscounts(): Discount[] {
    return this.discounts.filter((discount) => {
      const matchesSearch =
        discount.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        discount.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus =
        !this.selectedStatus ||
        this.discountService.getDiscountStatus(discount) === this.selectedStatus;
      const matchesType = !this.selectedType || discount.discountType === this.selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  get isEmpty(): boolean {
    return !this.loading && this.filteredDiscounts.length === 0;
  }

  // Quick actions
  duplicateDiscount(discount: Discount): void {
    const newDiscount = {
      code: this.discountService.generateDiscountCode(),
      description: `${discount.description} (Copy)`,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      minBookingAmount: discount.minBookingAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      minBookingDays: discount.minBookingDays,
      maxUsageCount: discount.maxUsageCount,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: discount.validUntil,
      applicablePropertyTypes: discount.applicablePropertyTypes,
      applicableListingTypes: discount.applicableListingTypes,
    };

    this.discountService.createDiscount(newDiscount).subscribe({
      next: () => {
        this.loadDiscounts();
        alert('Discount duplicated successfully!');
      },
      error: (err) => {
        this.logger.error('Error duplicating discount:', err);
        alert('Failed to duplicate discount');
      },
    });
  }
}
