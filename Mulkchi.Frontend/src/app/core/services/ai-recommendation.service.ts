import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Property } from '../models/property.model';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';
import { PropertyService } from './property.service';

import {
  AiRecommendation,
  HybridRecommendationResponse,
  RecommendationAnalytics,
  RecommendationRequest,
  RecommendationType,
} from '../models/ai-recommendation.model';

@Injectable({
  providedIn: 'root',
})
export class AiRecommendationService {
  private readonly apiUrl = `${environment.apiUrl}/AiRecommendations`;

  constructor(
    private http: HttpClient,
    private propertyService: PropertyService,
    private authService: AuthService,
    private logger: LoggingService,
  ) {}

  // Get recommendations for users (derived from available properties)
  getRecommendations(request: RecommendationRequest = {}): Observable<AiRecommendation[]> {
    const limit = request.limit ?? 10;

    if (request.propertyId) {
      return this.propertyService.getSimilarProperties(request.propertyId, limit).pipe(
        map((properties) =>
          this.mapToRecommendations(properties, RecommendationType.SimilarProperty),
        ),
        catchError(this.handleError),
      );
    }

    if (request.city || request.region || request.location) {
      return this.getLocationRecommendations(
        request.location || request.city || request.region || '',
        limit,
      );
    }

    if (request.latitude != null && request.longitude != null) {
      return this.getHybridRecommendations(request);
    }

    return this.getHybridRecommendations(request).pipe(
      map((recommendations) => {
        if (recommendations.length > 0) {
          return recommendations;
        }

        return this.mapToRecommendations(
          [],
          request.recommendationType ?? RecommendationType.Featured,
        );
      }),
      catchError(this.handleError),
    );
  }

  // Get personalized recommendations for current user
  getPersonalizedRecommendations(limit = 10): Observable<AiRecommendation[]> {
    return this.getHybridRecommendations({
      limit,
      includeViewed: false,
      includeClicked: false,
    });
  }

  getHybridRecommendations(request: RecommendationRequest = {}): Observable<AiRecommendation[]> {
    const currentUserId = request.userId || this.authService.getCurrentUser()?.id;

    const payload: any = {
      userId: currentUserId,
      latitude: request.latitude,
      longitude: request.longitude,
      radiusKm: request.radiusKm,
      limit: request.limit ?? 10,
    };

    return this.http.post<HybridRecommendationResponse[]>(`${this.apiUrl}/hybrid`, payload).pipe(
      map((recommendations) => this.mapHybridRecommendations(recommendations || [])),
      catchError(this.handleError),
    );
  }

  // Get similar properties for a specific property
  getSimilarProperties(propertyId: string, limit = 6): Observable<AiRecommendation[]> {
    return this.getRecommendations({
      propertyId,
      recommendationType: RecommendationType.SimilarProperty,
      limit,
      includeViewed: true,
      includeClicked: true,
    });
  }

  // Get popular properties in area
  getPopularInArea(city: string, limit = 8): Observable<AiRecommendation[]> {
    return this.getLocationRecommendations(city, limit);
  }

  // Get trending properties
  getTrendingProperties(limit = 10): Observable<AiRecommendation[]> {
    return this.propertyService.getFeaturedProperties(limit).pipe(
      map((properties) => this.mapToRecommendations(properties, RecommendationType.Trending)),
      catchError(this.handleError),
    );
  }

  // Get new listings
  getNewListings(limit = 8): Observable<AiRecommendation[]> {
    return this.propertyService.getProperties(1, limit).pipe(
      map((result) => {
        const items = Array.isArray((result as any).items)
          ? (result as any).items
          : Array.isArray(result)
            ? (result as any)
            : [];

        return this.mapToRecommendations(items, RecommendationType.NewListing);
      }),
      catchError(this.handleError),
    );
  }

  // Get recently viewed properties
  getRecentlyViewed(userId: string, limit = 6): Observable<AiRecommendation[]> {
    return this.getRecommendations({
      userId,
      recommendationType: RecommendationType.RecentlyViewed,
      limit,
    });
  }

  // Track recommendation interactions
  trackRecommendationView(recommendationId: string): Observable<void> {
    return of(void 0);
  }

  trackRecommendationClick(recommendationId: string): Observable<void> {
    return of(void 0);
  }

  // Admin operations
  createRecommendation(request: any): Observable<AiRecommendation> {
    return this.http
      .post<AiRecommendation>(this.apiUrl, request)
      .pipe(catchError(this.handleError));
  }

  updateRecommendation(id: string, request: any): Observable<AiRecommendation> {
    return this.http
      .put<AiRecommendation>(`${this.apiUrl}/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  deleteRecommendation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  // Analytics
  getRecommendationAnalytics(): Observable<RecommendationAnalytics> {
    return this.http
      .get<RecommendationAnalytics>(`${this.apiUrl}/analytics`)
      .pipe(catchError(this.handleError));
  }

  getLocationRecommendations(location: string, limit = 8): Observable<AiRecommendation[]> {
    const query = (location || '').trim();

    return this.propertyService.getProperties(1, 50).pipe(
      map((result) => {
        const items = Array.isArray((result as any).items)
          ? (result as any).items
          : Array.isArray(result)
            ? (result as any)
            : [];

        const normalized = query.toLowerCase();
        const filtered = normalized
          ? items.filter((p: Property) => {
              const city = (p.city || '').toLowerCase();
              const region = (p.region || '').toLowerCase();
              return city.includes(normalized) || region.includes(normalized);
            })
          : items;

        const ranked = [...filtered].sort(
          (a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0),
        );

        return this.mapToRecommendations(
          ranked.slice(0, limit),
          RecommendationType.PopularInArea,
          query ? `"${query}" hududiga mos tavsiya` : 'Siz uchun tavsiya',
        );
      }),
      catchError(this.handleError),
    );
  }

  // Utility methods
  getRecommendationTypeLabel(type: RecommendationType): string {
    const labels = {
      [RecommendationType.SimilarProperty]: "O'xshash uylar",
      [RecommendationType.PopularInArea]: 'Mashhur hududda',
      [RecommendationType.RecentlyViewed]: "Yaqinda ko'rilgan",
      [RecommendationType.PriceBased]: 'Narx asosida',
      [RecommendationType.PreferenceBased]: 'Afzallik asosida',
      [RecommendationType.Trending]: 'Trenddagi',
      [RecommendationType.NewListing]: "Yangi qo'shilgan",
      [RecommendationType.Featured]: 'Tanlangan',
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
      [RecommendationType.Featured]: 'bg-orange-100 text-orange-800',
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
    return recommendations.filter((r) => r.recommendationType === type);
  }

  // Sort recommendations by score
  sortByScore(recommendations: AiRecommendation[]): AiRecommendation[] {
    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Get top recommendations
  getTopRecommendations(recommendations: AiRecommendation[], limit = 5): AiRecommendation[] {
    return this.sortByScore(recommendations).slice(0, limit);
  }

  private mapToRecommendations(
    properties: Property[],
    type: RecommendationType,
    reasonOverride?: string,
  ): AiRecommendation[] {
    return (properties || []).map((property, index) => {
      const imageUrl =
        Array.isArray(property.images) && property.images.length ? property.images[0].url : '';

      const price = property.salePrice ?? property.monthlyRent ?? property.pricePerNight ?? 0;

      return {
        id: `local-${property.id}-${index}`,
        propertyId: property.id,
        recommendationType: type,
        score: Math.max(0.5, 1 - index * 0.05),
        reason: reasonOverride || this.getRecommendationTypeLabel(type),
        createdAt: new Date().toISOString(),
        isViewed: false,
        isClicked: false,
        property: {
          id: property.id,
          title: property.title,
          description: property.description,
          price,
          address: property.address,
          city: property.city,
          region: property.region,
          propertyType: property.type,
          listingType: property.listingType,
          area: property.area,
          roomsCount: property.numberOfBedrooms,
          bathroomsCount: property.numberOfBathrooms,
          imageUrl,
          images: Array.isArray(property.images) ? property.images.map((i: any) => i.url) : [],
          hostId: property.ownerId,
          hostName: '',
          rating: Number(property.averageRating || 0),
          reviewsCount: Number(property.reviewsCount || 0),
          viewsCount: Number(property.viewsCount || 0),
          isFeatured: !!property.isFeatured,
          isVerified: !!property.isVerified,
        },
      };
    });
  }

  private mapHybridRecommendations(
    recommendations: HybridRecommendationResponse[],
  ): AiRecommendation[] {
    return recommendations.map((recommendation) => ({
      id: recommendation.id,
      userId: recommendation.userId,
      propertyId: recommendation.propertyId,
      recommendationType: this.mapRecommendationType(recommendation.recommendationType),
      score: recommendation.score,
      reason: recommendation.reason,
      createdAt: recommendation.createdAt,
      isViewed: recommendation.isViewed,
      isClicked: recommendation.isClicked,
      property: {
        id: recommendation.property.id,
        title: recommendation.property.title,
        description: recommendation.property.description,
        price: recommendation.property.price,
        address: recommendation.property.address,
        city: recommendation.property.city,
        region: recommendation.property.region,
        propertyType: recommendation.property.propertyType,
        listingType: recommendation.property.listingType,
        area: recommendation.property.area,
        roomsCount: recommendation.property.roomsCount,
        bathroomsCount: recommendation.property.bathroomsCount,
        imageUrl: recommendation.property.imageUrl,
        images: recommendation.property.images,
        hostId: recommendation.property.hostId,
        hostName: recommendation.property.hostName,
        rating: recommendation.property.rating,
        reviewsCount: recommendation.property.reviewsCount,
        viewsCount: recommendation.property.viewsCount,
        distanceKm: recommendation.property.distanceKm,
        isFeatured: recommendation.property.isFeatured,
        isVerified: recommendation.property.isVerified,
      },
    }));
  }

  private mapRecommendationType(type: string): RecommendationType {
    return (type as RecommendationType) || RecommendationType.PreferenceBased;
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
