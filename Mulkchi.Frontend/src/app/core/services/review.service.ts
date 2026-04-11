import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReviewRequest, PagedResult, Review, ReviewSummary } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getMyReviews(page = 1, pageSize = 10): Observable<PagedResult<Review>> {
    return this.http.get<PagedResult<Review>>(`${this.apiUrl}`, {
      params: { page, pageSize },
    });
  }

  getPropertyReviews(propertyId: string, page = 1, pageSize = 5): Observable<PagedResult<Review>> {
    return this.http.get<PagedResult<Review>>(`${this.apiUrl}/property/${propertyId}`, {
      params: { page, pageSize },
    });
  }

  getReviewSummary(propertyId: string): Observable<ReviewSummary> {
    return this.http.get<ReviewSummary>(`${this.apiUrl}/property/${propertyId}/summary`);
  }

  createReview(request: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, request);
  }

  updateReview(id: string, request: CreateReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}`, { id, ...request });
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
