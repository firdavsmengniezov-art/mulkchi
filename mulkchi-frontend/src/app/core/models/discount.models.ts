export type DiscountType = 'Percentage' | 'Fixed';
export type DiscountTarget =
  | 'AllUsers'
  | 'Hosts'
  | 'Guests'
  | 'SpecificUser'
  | 'SpecificProperty';

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
