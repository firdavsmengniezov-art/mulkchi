import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import { 
  AiRecommendation, 
  RecommendationRequest,
  RecommendationAnalytics,
  RecommendationType 
} from '../models/ai-recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class AiRecommendationService {
  private readonly apiUrl = `${environment.apiUrl}/ai-recommendations`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  // Get recommendations for users
  getRecommendations(request: RecommendationRequest = {}): Observable<AiRecommendation[]> {
    const params = new URLSearchParams();
    
    if (request.userId) params.append('userId', request.userId);
    if (request.propertyId) params.append('propertyId', request.propertyId);
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.recommendationType) params.append('recommendationType', request.recommendationType);
    if (request.includeViewed !== undefined) params.append('includeViewed', request.includeViewed.toString());
    if (request.includeClicked !== undefined) params.append('includeClicked', request.includeClicked.toString());

    const url = params.toString() ? `${this.apiUrl}?${params}` : this.apiUrl;
    
    return this.http.get<AiRecommendation[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  // Get personalized recommendations for current user
  getPersonalizedRecommendations(limit = 10): Observable<AiRecommendation[]> {
    return this.getRecommendations({
      limit,
      includeViewed: false,
      includeClicked: false
    });
  }

  // Get similar properties for a specific property
  getSimilarProperties(propertyId: string, limit = 6): Observable<AiRecommendation[]> {
    return this.getRecommendations({
      propertyId,
      recommendationType: RecommendationType.SimilarProperty,
      limit,
      includeViewed: true,
      includeClicked: true
    });
  }

  // Get popular properties in area
  getPopularInArea(city: string, limit = 8): Observable<AiRecommendation[]> {
    return this.http.get<AiRecommendation[]>(`${this.apiUrl}/popular/${city}?limit=${limit}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get trending properties
  getTrendingProperties(limit = 10): Observable<AiRecommendation[]> {
    return this.getRecommendations({
      recommendationType: RecommendationType.Trending,
      limit
    });
  }

  // Get new listings
  getNewListings(limit = 8): Observable<AiRecommendation[]> {
    return this.getRecommendations({
      recommendationType: RecommendationType.NewListing,
      limit
    });
  }

  // Get recently viewed properties
  getRecentlyViewed(userId: string, limit = 6): Observable<AiRecommendation[]> {
    return this.getRecommendations({
      userId,
      recommendationType: RecommendationType.RecentlyViewed,
      limit
    });
  }

  // Track recommendation interactions
  trackRecommendationView(recommendationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${recommendationId}/view`, {}).pipe(
      catchError(this.handleError)
    );
  }

  trackRecommendationClick(recommendationId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${recommendationId}/click`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Admin operations
  createRecommendation(request: any): Observable<AiRecommendation> {
    return this.http.post<AiRecommendation>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  updateRecommendation(id: string, request: any): Observable<AiRecommendation> {
    return this.http.put<AiRecommendation>(`${this.apiUrl}/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteRecommendation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Analytics
  getRecommendationAnalytics(): Observable<RecommendationAnalytics> {
    return this.http.get<RecommendationAnalytics>(`${this.apiUrl}/analytics`).pipe(
      catchError(this.handleError)
    );
  }

  // Utility methods
  getRecommendationTypeLabel(type: RecommendationType): string {
    const labels = {
      [RecommendationType.SimilarProperty]: 'O\'xshash uylar',
      [RecommendationType.PopularInArea]: 'Mashhur hududda',
      [RecommendationType.RecentlyViewed]: 'Yaqinda ko\'rilgan',
      [RecommendationType.PriceBased]: 'Narx asosida',
      [RecommendationType.PreferenceBased]: 'Afzallik asosida',
      [RecommendationType.Trending]: 'Trenddagi',
      [RecommendationType.NewListing]: 'Yangi qo\'shilgan',
      [RecommendationType.Featured]: 'Tanlangan'
    };
    return labels[type] || type;
  }

  getRecommendationTypeColor(type: RecommendationType): string {
    const colors = {
      [RecommendationType.SimilarProperty]: 'bg-blue-100 text-blue-800',
      [RecommendationType.PopularInArea]: 'bg-green-100 text-green-800',
      [RecommendationType.RecentlyViewed]: 'bg-purple-100 text-purple-800',
      [RecommendationType.PriceBased]: 'bg-yellow-100 text-yellow-800',
      [RecommendationType.PreferenceBased]: 'bg-pink-100 text-pink-800',
      [RecommendationType.Trending]: 'bg-red-100 text-red-800',
      [RecommendationType.NewListing]: 'bg-indigo-100 text-indigo-800',
      [RecommendationType.Featured]: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  formatScore(score: number): string {
    return `${Math.round(score * 100)}%`;
  }

  isHighScore(score: number): boolean {
    return score >= 0.8;
  }

  isMediumScore(score: number): boolean {
    return score >= 0.6 && score < 0.8;
  }

  getScoreColor(score: number): string {
    if (this.isHighScore(score)) return 'text-green-600';
    if (this.isMediumScore(score)) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Filter recommendations by type
  filterByType(recommendations: AiRecommendation[], type: RecommendationType): AiRecommendation[] {
    return recommendations.filter(r => r.recommendationType === type);
  }

  // Sort recommendations by score
  sortByScore(recommendations: AiRecommendation[]): AiRecommendation[] {
    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Get top recommendations
  getTopRecommendations(recommendations: AiRecommendation[], limit = 5): AiRecommendation[] {
    return this.sortByScore(recommendations).slice(0, limit);
  }

  private handleError(error: any): Observable<never> {
    this.logger.error('AiRecommendationService error:', error);
    let errorMessage = 'An error occurred with AI recommendations';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to access recommendations';
    } else if (error.status === 404) {
      errorMessage = 'No recommendations found';
    }
    
    return throwError(() => errorMessage);
  }
}
