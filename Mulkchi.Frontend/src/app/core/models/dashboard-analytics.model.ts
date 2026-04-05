export interface DashboardAnalytics {
  overview: OverviewMetrics;
  revenue: RevenueAnalytics;
  users: UserAnalytics;
  properties: PropertyAnalytics;
  bookings: BookingAnalytics;
  views: ViewAnalytics;
  recommendations: RecommendationAnalytics;
}

export interface OverviewMetrics {
  totalRevenue: number;
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  monthlyGrowth: {
    revenue: number;
    users: number;
    properties: number;
    bookings: number;
  };
  yearlyGrowth: {
    revenue: number;
    users: number;
    properties: number;
    bookings: number;
  };
}

export interface RevenueAnalytics {
  monthlyRevenue: MonthlyRevenue[];
  yearlyRevenue: YearlyRevenue[];
  revenueByRegion: RegionRevenue[];
  revenueByPropertyType: PropertyTypeRevenue[];
  averageBookingValue: number;
  totalDiscountAmount: number;
  projectedRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookingsCount: number;
  averageValue: number;
  growth: number;
}

export interface YearlyRevenue {
  year: number;
  revenue: number;
  bookingsCount: number;
  growth: number;
}

export interface RegionRevenue {
  region: string;
  revenue: number;
  bookingsCount: number;
  percentage: number;
}

export interface PropertyTypeRevenue {
  propertyType: string;
  revenue: number;
  bookingsCount: number;
  averagePrice: number;
}

export interface UserAnalytics {
  userGrowth: UserGrowthData[];
  userDemographics: UserDemographics;
  userActivity: UserActivityMetrics;
  userRetention: UserRetentionData[];
  userSegmentation: UserSegmentation[];
}

export interface UserGrowthData {
  date: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  growth: number;
}

export interface UserDemographics {
  byRegion: { region: string; count: number; percentage: number }[];
  byAge: { ageGroup: string; count: number; percentage: number }[];
  byRole: { role: string; count: number; percentage: number }[];
}

export interface UserActivityMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
}

export interface UserRetentionData {
  period: string;
  retentionRate: number;
  churnRate: number;
  newUsers: number;
  returningUsers: number;
}

export interface UserSegmentation {
  segment: string;
  count: number;
  percentage: number;
  averageRevenue: number;
}

export interface PropertyAnalytics {
  propertyGrowth: PropertyGrowthData[];
  topViewedProperties: TopProperty[];
  topBookedProperties: TopProperty[];
  propertyPerformance: PropertyPerformance[];
  propertyTypeDistribution: PropertyTypeDistribution[];
}

export interface PropertyGrowthData {
  date: string;
  totalProperties: number;
  newProperties: number;
  activeProperties: number;
}

export interface TopProperty {
  id: string;
  title: string;
  viewsCount: number;
  bookingsCount: number;
  revenue: number;
  rating: number;
  city: string;
  propertyType: string;
}

export interface PropertyPerformance {
  propertyId: string;
  title: string;
  viewsToBookingsRatio: number;
  averageBookingValue: number;
  occupancyRate: number;
  revenuePerView: number;
}

export interface PropertyTypeDistribution {
  propertyType: string;
  count: number;
  percentage: number;
  averagePrice: number;
  averageOccupancy: number;
}

export interface BookingAnalytics {
  bookingTrends: BookingTrendData[];
  bookingByRegion: BookingByRegion[];
  bookingByPropertyType: BookingByPropertyType[];
  bookingConversion: BookingConversionData[];
  seasonalTrends: SeasonalTrendData[];
}

export interface BookingTrendData {
  date: string;
  bookingsCount: number;
  revenue: number;
  averageValue: number;
  cancellationRate: number;
}

export interface BookingByRegion {
  region: string;
  bookingsCount: number;
  revenue: number;
  averageValue: number;
  growth: number;
}

export interface BookingByPropertyType {
  propertyType: string;
  bookingsCount: number;
  revenue: number;
  averageValue: number;
  popularity: number;
}

export interface BookingConversionData {
  date: string;
  viewsCount: number;
  bookingsCount: number;
  conversionRate: number;
  revenue: number;
}

export interface SeasonalTrendData {
  season: string;
  bookingsCount: number;
  revenue: number;
  averageValue: number;
  yearOverYearGrowth: number;
}

export interface ViewAnalytics {
  totalViews: number;
  uniqueViews: number;
  viewsByProperty: PropertyViewData[];
  viewsByRegion: RegionViewData[];
  viewsByDevice: DeviceViewData[];
  viewTrends: ViewTrendData[];
}

export interface PropertyViewData {
  propertyId: string;
  title: string;
  viewsCount: number;
  uniqueViews: number;
  averageViewDuration: number;
  bookingConversionRate: number;
}

export interface RegionViewData {
  region: string;
  viewsCount: number;
  uniqueViews: number;
  averageViewDuration: number;
  bookingConversionRate: number;
}

export interface DeviceViewData {
  device: string;
  viewsCount: number;
  percentage: number;
  averageViewDuration: number;
  bounceRate: number;
}

export interface ViewTrendData {
  date: string;
  viewsCount: number;
  uniqueViews: number;
  averageViewDuration: number;
  bounceRate: number;
}

export interface RecommendationAnalytics {
  totalRecommendations: number;
  viewedRecommendations: number;
  clickedRecommendations: number;
  conversionRate: number;
  clickThroughRate: number;
  topRecommendationTypes: RecommendationTypeStats[];
  recommendationPerformance: RecommendationPerformance[];
  userEngagement: RecommendationUserEngagement;
}

export interface RecommendationTypeStats {
  type: string;
  count: number;
  clickRate: number;
  conversionRate: number;
  averageScore: number;
}

export interface RecommendationPerformance {
  propertyId: string;
  propertyTitle: string;
  recommendationsCount: number;
  clicksCount: number;
  bookingsCount: number;
  conversionRate: number;
  revenue: number;
}

export interface RecommendationUserEngagement {
  averageViewTime: number;
  clickThroughRate: number;
  bounceRate: number;
  engagementScore: number;
}

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  region?: string;
  propertyType?: string;
  userType?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export enum AnalyticsPeriod {
  Today = 'Today',
  Week = 'Week',
  Month = 'Month',
  Quarter = 'Quarter',
  Year = 'Year',
  All = 'All'
}
