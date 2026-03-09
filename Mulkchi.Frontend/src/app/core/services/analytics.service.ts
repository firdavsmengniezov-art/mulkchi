import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PricePredictionRequest, PricePredictionResponse, MarketOverview } from '../interfaces/analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private apiService: ApiService) {}

  getMarketOverview(): Observable<MarketOverview> {
    return this.apiService.get<MarketOverview>('/analytics/market-overview');
  }

  getAnalyticsByRegion(): Observable<any> {
    return this.apiService.get<any>('/analytics/by-region');
  }

  getPriceTrends(): Observable<any> {
    return this.apiService.get<any>('/analytics/price-trends');
  }

  predictPrice(request: PricePredictionRequest): Observable<PricePredictionResponse> {
    return this.apiService.post<PricePredictionResponse>('/analytics/predict-price', request);
  }

  getModelStatus(): Observable<any> {
    return this.apiService.get<any>('/analytics/model-status');
  }

  trainModel(): Observable<any> {
    return this.apiService.post<any>('/analytics/train-model', {}, true);
  }
}
