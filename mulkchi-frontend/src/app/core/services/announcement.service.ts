import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Announcement } from '../models/announcement.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/announcements`;

  getAll(page = 1, pageSize = 10): Observable<PagedResult<Announcement>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Announcement>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.baseUrl}/${id}`);
  }
}
