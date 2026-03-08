export enum DiscountType { Percentage = 0, FixedAmount = 1 }
export enum DiscountTarget { AllProperties = 0, SpecificProperty = 1, SpecificUser = 2, FirstBooking = 3 }

export interface Discount {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  target: DiscountTarget;
  value: number;
  maxDiscountAmount?: number;
  maxUsageCount?: number;
  usageCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  propertyId?: string;
  userId?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}

export interface DiscountUsage {
  id: string;
  userId: string;
  discountId: string;
  homeRequestId?: string;
  amountSaved: number;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
