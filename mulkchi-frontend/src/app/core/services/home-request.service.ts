import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HomeRequest } from '../models/home-request.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class HomeRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/homerequests`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<HomeRequest>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<HomeRequest>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<HomeRequest> {
    return this.http.get<HomeRequest>(`${this.baseUrl}/${id}`);
  }

  create(req: Partial<HomeRequest>): Observable<HomeRequest> {
    return this.http.post<HomeRequest>(this.baseUrl, req);
  }

  update(req: HomeRequest): Observable<HomeRequest> {
    return this.http.put<HomeRequest>(this.baseUrl, req);
  }

  delete(id: string): Observable<HomeRequest> {
    return this.http.delete<HomeRequest>(`${this.baseUrl}/${id}`);
  }
}
