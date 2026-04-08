import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

import {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../models/announcement.model';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private readonly apiUrl = `${environment.apiUrl}/announcements`;

  constructor(private http: HttpClient,
    private logger: LoggingService) {}

  getAnnouncements(
    page = 1,
    pageSize = 10,
  ): Observable<{ items: Announcement[]; totalCount: number; page: number; pageSize: number }> {
    return this.http
      .get<any>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`)
      .pipe(catchError(this.handleError));
  }

  getActiveAnnouncements(): Observable<Announcement[]> {
    return this.http
      .get<Announcement[]>(`${this.apiUrl}/active`)
      .pipe(catchError(this.handleError));
  }

  getAnnouncementById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  createAnnouncement(request: CreateAnnouncementRequest): Observable<Announcement> {
    return this.http.post<Announcement>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  updateAnnouncement(request: UpdateAnnouncementRequest): Observable<Announcement> {
    return this.http.put<Announcement>(this.apiUrl, request).pipe(catchError(this.handleError));
  }

  deleteAnnouncement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  toggleAnnouncementStatus(id: string, isActive: boolean): Observable<Announcement> {
    return this.updateAnnouncement({
      id,
      isActive,
    });
  }

  private handleError(error: any): Observable<never> {
    this.logger.error('AnnouncementService error:', error);
    let errorMessage = 'An error occurred with announcements';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to manage announcements';
    }

    return throwError(() => errorMessage);
  }
}
