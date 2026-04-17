import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PricePredictionRequest, PricePredictionResponse } from '../models';

export interface MarketOverview {
  totalProperties: number;
  averagePrice: number;
  averageRent: number;
  totalTransactions: number;
  growthRate: number;
}

export interface RegionStats {
  region: string;
  totalProperties: number;
  averagePrice: number;
  averageRent: number;
}

export interface PriceTrendPoint {
  month: string;
  averagePrice: number;
  listingsCount: number;
}

export interface DistrictStats {
  region: string;
  district: string;
  listingsCount: number;
  averageSalePrice: number;
  averageRentPrice: number;
  minSalePrice: number;
  maxSalePrice: number;
  minRentPrice: number;
  maxRentPrice: number;
  pricePerSqm: number;
}

export interface DistrictPriceRange {
  district: string;
  salePriceRange: {
    min: number;
    max: number;
    average: number;
    median: number;
    quartile25: number;
    quartile75: number;
    count: number;
  };
  rentPriceRange: {
    min: number;
    max: number;
    average: number;
    median: number;
    quartile25: number;
    quartile75: number;
    count: number;
  };
  propertyTypes: Array<{
    type: string;
    count: number;
    averagePrice: number;
  }>;
}

export interface AiRecommendationAccuracy {
  totalRecommendations: number;
  viewedRecommendations: number;
  clickedRecommendations: number;
  clickThroughRate: number;
  conversionRate: number;
  byType: Array<{
    type: string;
    total: number;
    viewed: number;
    clicked: number;
    conversionRate: number;
    averageScore: number;
  }>;
  abTestPerformance: {
    variantA: { count: number; clicks: number; ctr: number };
    variantB: { count: number; clicks: number; ctr: number };
  };
  pricePredictionAccuracy: {
    averageDeviation: number;
    predictionsCount: number;
    within5Percent: number;
    within10Percent: number;
    within20Percent: number;
  };
}

export interface PriceHeatmapData {
  gridCells: Array<{
    latitude: number;
    longitude: number;
    count: number;
    averageSalePrice: number;
    averageRentPrice: number;
    minPrice: number;
    maxPrice: number;
    density: number;
  }>;
  priceStats: {
    min: number;
    max: number;
    average: number;
    median: number;
    p25: number;
    p75: number;
  };
  totalPoints: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getMarketOverview(): Observable<MarketOverview> {
    return this.http.get<MarketOverview>(`${this.apiUrl}/market-overview`);
  }

  getByRegion(): Observable<RegionStats[]> {
    return this.http.get<RegionStats[]>(`${this.apiUrl}/by-region`);
  }

  getPriceTrends(): Observable<PriceTrendPoint[]> {
    return this.http.get<PriceTrendPoint[]>(`${this.apiUrl}/price-trends`);
  }

  predictPrice(req: PricePredictionRequest): Observable<PricePredictionResponse> {
    return this.http.post<PricePredictionResponse>(`${this.apiUrl}/predict-price`, req);
  }

  // New endpoints for district analytics
  getByDistrict(): Observable<DistrictStats[]> {
    return this.http.get<DistrictStats[]>(`${this.apiUrl}/by-district`);
  }

  getDistrictPriceRanges(): Observable<DistrictPriceRange[]> {
    return this.http.get<DistrictPriceRange[]>(`${this.apiUrl}/district-price-ranges`);
  }

  // AI recommendation accuracy
  getAiRecommendationAccuracy(): Observable<AiRecommendationAccuracy> {
    return this.http.get<AiRecommendationAccuracy>(`${this.apiUrl}/ai-recommendation-accuracy`);
  }

  // Price heatmap for map visualization
  getPriceHeatmap(): Observable<PriceHeatmapData> {
    return this.http.get<PriceHeatmapData>(`${this.apiUrl}/price-heatmap`);
  }
}
