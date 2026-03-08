import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AiRecommendation } from '../models/ai-recommendation.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class AiRecommendationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/airecommendations`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<AiRecommendation>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<AiRecommendation>>(this.baseUrl, {
      params,
    });
  }

  getById(id: string): Observable<AiRecommendation> {
    return this.http.get<AiRecommendation>(`${this.baseUrl}/${id}`);
  }

  create(
    recommendation: Partial<AiRecommendation>,
  ): Observable<AiRecommendation> {
    return this.http.post<AiRecommendation>(this.baseUrl, recommendation);
  }

  update(recommendation: AiRecommendation): Observable<AiRecommendation> {
    return this.http.put<AiRecommendation>(this.baseUrl, recommendation);
  }

  delete(id: string): Observable<AiRecommendation> {
    return this.http.delete<AiRecommendation>(`${this.baseUrl}/${id}`);
  }
}
