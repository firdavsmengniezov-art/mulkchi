import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PropertyView } from '../models/property-view.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class PropertyViewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/propertyviews`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<PropertyView>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<PropertyView>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<PropertyView> {
    return this.http.get<PropertyView>(`${this.baseUrl}/${id}`);
  }

  create(view: Partial<PropertyView>): Observable<PropertyView> {
    return this.http.post<PropertyView>(this.baseUrl, view);
  }

  delete(id: string): Observable<PropertyView> {
    return this.http.delete<PropertyView>(`${this.baseUrl}/${id}`);
  }
}
