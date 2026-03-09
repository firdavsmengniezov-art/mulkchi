export interface PricePredictionRequest {
  area: number;
  bedrooms: number;
  bathrooms: number;
  region: number;
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
  isRenovated: boolean;
  hasElevator: boolean;
  distanceToCityCenter: number;
}

export interface PricePredictionResponse {
  predictedPrice: number;
  currency: string;
  confidence: ConfidenceLevel;
  priceRange: PriceRange;
  basedOnProperties: number;
  recommendation: string;
}

export enum ConfidenceLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  VeryHigh = 3
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface MarketOverview {
  totalProperties: number;
  averagePrice: number;
  averageRent: number;
  propertiesByRegion: RegionData[];
  priceTrends: PriceTrend[];
}

export interface RegionData {
  region: string;
  count: number;
  averagePrice: number;
}

export interface PriceTrend {
  month: string;
  averagePrice: number;
  averageRent: number;
}
