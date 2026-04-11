export interface AiRecommendation {
  id: string;
  userId?: string;
  propertyId: string;
  recommendationType: RecommendationType;
  abVariant?: string;
  score: number;
  reason: string;
  property: RecommendationProperty;
  createdAt: string;
  expiresAt?: string;
  isViewed: boolean;
  isClicked: boolean;
}

export interface RecommendationProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  region: string;
  propertyType: string;
  listingType: string;
  area: number;
  roomsCount: number;
  bathroomsCount: number;
  imageUrl: string;
  images: string[];
  hostId: string;
  hostName: string;
  rating: number;
  reviewsCount: number;
  viewsCount: number;
  distanceKm?: number;
  isFeatured: boolean;
  isVerified: boolean;
}

export interface HybridRecommendationPropertyResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  region: string;
  propertyType: string;
  listingType: string;
  area: number;
  roomsCount: number;
  bathroomsCount: number;
  imageUrl: string;
  images: string[];
  hostId: string;
  hostName: string;
  rating: number;
  reviewsCount: number;
  viewsCount: number;
  distanceKm?: number;
  isFeatured: boolean;
  isVerified: boolean;
}

export interface HybridRecommendationResponse {
  id: string;
  userId?: string;
  propertyId: string;
  recommendationType: string;
  abVariant?: string;
  score: number;
  reason: string;
  property: HybridRecommendationPropertyResponse;
  createdAt: string;
  isViewed: boolean;
  isClicked: boolean;
}

export interface CreateRecommendationRequest {
  userId?: string;
  propertyId: string;
  recommendationType: RecommendationType;
  score: number;
  reason: string;
  expiresAt?: string;
}

export interface RecommendationRequest {
  userId?: string;
  propertyId?: string;
  location?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
  recommendationType?: RecommendationType;
  includeViewed?: boolean;
  includeClicked?: boolean;
}

export interface RecommendationAnalytics {
  totalRecommendations: number;
  viewedRecommendations: number;
  clickedRecommendations: number;
  conversionRate: number;
  topRecommendationTypes: { type: RecommendationType; count: number }[];
  recommendationsByDay: { date: string; count: number }[];
  userEngagement: {
    avgViewTime: number;
    clickThroughRate: number;
    bounceRate: number;
  };
}

export enum RecommendationType {
  SimilarProperty = 'SimilarProperty',
  PopularInArea = 'PopularInArea',
  RecentlyViewed = 'RecentlyViewed',
  PriceBased = 'PriceBased',
  PreferenceBased = 'PreferenceBased',
  Trending = 'Trending',
  NewListing = 'NewListing',
  Featured = 'Featured',
}

export enum RecommendationSource {
  CollaborativeFiltering = 'CollaborativeFiltering',
  ContentBased = 'ContentBased',
  Hybrid = 'Hybrid',
  Popular = 'Popular',
  Recent = 'Recent',
}
