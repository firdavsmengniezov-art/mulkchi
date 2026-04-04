import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
    return this.http.get<PagedResult<Review>>(`${this.apiUrl}/reviews?propertyId=${propertyId}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  createReview(request: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, request).pipe(
      catchError(this.handleError)
    );
  }

  updateReview(id: string, request: Partial<CreateReviewRequest>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${id}`, request).pipe(
      catchError(this.handleError)
    );
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getMyReviews(page: number = 1, pageSize: number = 10): Observable<PagedResult<Review>> {
    return this.http.get<PagedResult<Review>>(`${this.apiUrl}/reviews/my?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/reviews/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getReviewSummary(propertyId: string): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.apiUrl}/reviews/property/${propertyId}/summary`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Review API Error:', error);
    return throwError(() => error);
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
