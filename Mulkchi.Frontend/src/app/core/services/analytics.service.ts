import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PricePredictionRequest, PricePredictionResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;
  
  constructor(private http: HttpClient) {}

  getMarketOverview(): Observable<any> { 
    return this.http.get(`${this.apiUrl}/market-overview`); 
  }

  getByRegion(): Observable<any> { 
    return this.http.get(`${this.apiUrl}/by-region`); 
  }

  predictPrice(req: PricePredictionRequest): Observable<PricePredictionResponse> {
    return this.http.post<PricePredictionResponse>(`${this.apiUrl}/predict-price`, req);
  }
}
