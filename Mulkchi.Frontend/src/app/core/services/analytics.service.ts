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
}
