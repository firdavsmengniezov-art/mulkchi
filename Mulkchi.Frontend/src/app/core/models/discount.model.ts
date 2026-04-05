export interface Discount {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  minBookingDays?: number;
  maxUsageCount?: number;
  currentUsageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicablePropertyTypes?: string[];
  applicableListingTypes?: string[];
  createdBy: string;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateDiscountRequest {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  minBookingDays?: number;
  maxUsageCount?: number;
  validFrom: string;
  validUntil: string;
  applicablePropertyTypes?: string[];
  applicableListingTypes?: string[];
}

export interface UpdateDiscountRequest {
  id: string;
  code?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  minBookingDays?: number;
  maxUsageCount?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
  applicablePropertyTypes?: string[];
  applicableListingTypes?: string[];
}

export interface DiscountUsage {
  id: string;
  discountId: string;
  userId: string;
  bookingId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedDate: string;
}

export interface DiscountValidationRequest {
  code: string;
  bookingAmount: number;
  propertyType?: string;
  listingType?: string;
  bookingDays?: number;
}

export interface DiscountValidationResponse {
  isValid: boolean;
  discount?: Discount;
  discountAmount?: number;
  finalAmount?: number;
  errorMessage?: string;
}

export enum DiscountType {
  Percentage = 'Percentage',
  FixedAmount = 'FixedAmount'
}

export enum DiscountStatus {
  Active = 'Active',
  Expired = 'Expired',
  Disabled = 'Disabled',
  UsageLimitReached = 'UsageLimitReached'
}
