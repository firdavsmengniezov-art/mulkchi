import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Review, 
  CreateReviewRequest, 
  ReviewSummary,
  PagedResult 
} from '../models/review.models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPropertyReviews(propertyId: string, page: number = 1, pageSize: number = 10): Observable<PagedResult<Review>> {
    const params = new HttpParams()
      .set('propertyId', propertyId)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResult<Review>>(`${this.apiUrl}/reviews`, { params });
  }

  createReview(request: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, request);
  }

  updateReview(id: string, request: Partial<CreateReviewRequest>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${id}`, request);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`);
  }

  getMyReviews(page: number = 1, pageSize: number = 10): Observable<PagedResult<Review>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResult<Review>>(`${this.apiUrl}/reviews/my`, { params });
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/reviews/${id}`);
  }

  getReviewSummary(propertyId: string): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.apiUrl}/reviews/property/${propertyId}/summary`);
  }

  // Helper methods
  getAverageRating(review: Review): number {
    const ratings = [
      review.overallRating,
      review.cleanlinessRating,
      review.locationRating,
      review.valueRating,
      review.communicationRating,
      review.accuracyRating
    ];
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1 <= rating ? 1 : 0);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
