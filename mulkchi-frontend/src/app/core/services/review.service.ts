import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models/property.models';
import { Review } from '../models/review.models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reviews`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<Review>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Review>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  create(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, review);
  }

  update(review: Review): Observable<Review> {
    return this.http.put<Review>(this.baseUrl, review);
  }

  delete(id: string): Observable<Review> {
    return this.http.delete<Review>(`${this.baseUrl}/${id}`);
  }
}
