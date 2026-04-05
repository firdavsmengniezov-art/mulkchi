export interface DiscountUsage {
  id: string;
  discountId: string;
  discountCode: string;
  userId: string;
  userName: string;
  bookingId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedDate: string;
  propertyTitle: string;
}

export interface CreateDiscountUsageRequest {
  discountId: string;
  bookingId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export interface DiscountUsageStatistics {
  totalUsageCount: number;
  totalDiscountAmount: number;
  totalBookingsAmount: number;
  averageDiscountPerBooking: number;
  usageByMonth: { month: string; count: number; amount: number }[];
  topDiscounts: { code: string; usageCount: number; totalDiscount: number }[];
}
