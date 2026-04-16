import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import {
  CreateHomeRequestRequest,
  HomeRequest,
  UpdateHomeRequestRequest,
} from '../models/home-request.model';

@Injectable({
  providedIn: 'root',
})
export class HomeRequestService {
  private readonly apiUrl = `${environment.apiUrl}/HomeRequests`;

  constructor(
    private http: HttpClient,
    private logger: LoggingService,
  ) {}

  getHomeRequests(
    page = 1,
    pageSize = 10,
  ): Observable<{ items: HomeRequest[]; totalCount: number; page: number; pageSize: number }> {
    return this.http
      .get<any>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`)
      .pipe(catchError(this.handleError));
  }

  getMyHomeRequests(): Observable<HomeRequest[]> {
    return this.getHomeRequests(1, 1000).pipe(
      map((result) => result.items ?? []),
      catchError(this.handleError),
    );
  }

  getHomeRequestById(id: string): Observable<HomeRequest> {
    return this.http.get<HomeRequest>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createHomeRequest(request: CreateHomeRequestRequest): Observable<HomeRequest> {
    return this.http.post<HomeRequest>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  updateHomeRequest(request: UpdateHomeRequestRequest): Observable<HomeRequest> {
    return this.http.put<HomeRequest>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  deleteHomeRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  updateHomeRequestStatus(id: string, status: string): Observable<HomeRequest> {
    return this.updateHomeRequest({
      id,
      status: status as any,
    });
  }

  // Admin methods
  getAllHomeRequests(status?: string): Observable<HomeRequest[]> {
    return this.getHomeRequests(1, 1000).pipe(
      map((result) => {
        const items = result.items ?? [];
        return status ? items.filter((item: any) => item.status === status) : items;
      }),
      catchError(this.handleError),
    );
  }

  private handleError = (error: any): Observable<never> => {
    this.logger.error('HomeRequestService error:', error);
    let errorMessage = 'An error occurred with home requests';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Please login to manage home requests';
    }

    return throwError(() => errorMessage);
  }
}
