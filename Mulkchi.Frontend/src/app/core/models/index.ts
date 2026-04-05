// Core models - export enums that are needed
export * from './analytics.model';
export * from './auth.model';
export * from './booking.model';
export * from './message.model';
export * from './notification.model';
export * from './pagination.model';
export * from './property.model';
export { ListingType, PropertyType } from './property.model';

// Property images (avoid conflicts)
export type {
  CreatePropertyImageRequest,
  PropertyImage,
  UpdatePropertyImageRequest,
} from './property-image.model';

// Feature models
export * from './announcement.model';

// Home request models (selective export to avoid conflicts)
export { ContactMethod, HomeRequestStatus } from './home-request.model';
export type {
  ContactInfo,
  CreateHomeRequestRequest,
  HomeRequest,
  UpdateHomeRequestRequest,
} from './home-request.model';

// Discount models (avoid conflicts)
export { DiscountStatus, DiscountType } from './discount.model';
export type {
  CreateDiscountRequest,
  Discount,
  DiscountValidationRequest,
  DiscountValidationResponse,
  UpdateDiscountRequest,
} from './discount.model';

export type {
  CreateDiscountUsageRequest,
  DiscountUsage,
  DiscountUsageStatistics,
} from './discount-usage.model';

// User models (avoid conflicts)
export { UserRole, UserStatus } from './user.model';
export type { CreateUserRequest, UpdateUserRequest, User, UserStatistics } from './user.model';

// Contract models
export * from './rental-contract.model';

// AI models (avoid conflicts)
export { RecommendationSource, RecommendationType } from './ai-recommendation.model';
export type {
  AiRecommendation,
  RecommendationAnalytics,
  RecommendationProperty,
  RecommendationRequest,
} from './ai-recommendation.model';

// Analytics models (avoid conflicts)
export { AnalyticsPeriod } from './dashboard-analytics.model';
export type {
  AnalyticsFilters,
  BookingAnalytics,
  DashboardAnalytics,
  OverviewMetrics,
  PropertyAnalytics,
  RevenueAnalytics,
  UserAnalytics,
  ViewAnalytics,
} from './dashboard-analytics.model';
