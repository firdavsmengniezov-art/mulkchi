export enum AiRecommendationType {
  PersonalizedListing = 0, SimilarProperty = 1, PriceOptimization = 2, MarketInsight = 3
}

export interface AiRecommendation {
  id: string;
  score: number;
  title?: string;
  description?: string;
  isActedUpon: boolean;
  metadata?: string;
  userId: string;
  propertyId?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
