import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResult, Property, PropertySearchParams } from '../models';
import { LoggingService } from './logging.service';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  getProperties(page = 1, size = 10): Observable<PagedResult<Property>> {
    return this.http
      .get<PagedResult<Property>>(`${this.apiUrl}?pageNumber=${page}&pageSize=${size}`)
      .pipe(catchError(this.handleError));
  }

  searchProperties(params: PropertySearchParams): Observable<PagedResult<Property>> {
    let query = Object.entries(params)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return this.http
      .get<PagedResult<Property>>(`${this.apiUrl}/search?${query}`)
      .pipe(catchError(this.handleError));
  }

  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createProperty(data: Record<string, any>): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, data).pipe(catchError(this.handleError));
  }

  updateProperty(id: string, data: Record<string, any>): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, data).pipe(catchError(this.handleError));
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  getAutocompleteSuggestions(query: string): Observable<string[]> {
    return this.http
      .get<string[]>(`${this.apiUrl}/autocomplete`, { params: { query } })
      .pipe(catchError(this.handleError));
  }

  getSimilarProperties(id: string, count: number = 6): Observable<Property[]> {
    return this.http
      .get<Property[]>(`${this.apiUrl}/${id}/similar`, { params: { count: count.toString() } })
      .pipe(catchError(this.handleError));
  }

  getFeaturedProperties(count: number = 8): Observable<Property[]> {
    return this.http
      .get<Property[]>(`${this.apiUrl}/featured`, { params: { count: count.toString() } })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    this.logger.error('API Error:', error);
    return throwError(() => error);
  }
}
