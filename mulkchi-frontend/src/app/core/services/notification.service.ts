import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<Notification>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Notification>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Notification> {
    return this.http.get<Notification>(`${this.baseUrl}/${id}`);
  }

  update(notification: Notification): Observable<Notification> {
    return this.http.put<Notification>(this.baseUrl, notification);
  }

  delete(id: string): Observable<Notification> {
    return this.http.delete<Notification>(`${this.baseUrl}/${id}`);
  }
}
