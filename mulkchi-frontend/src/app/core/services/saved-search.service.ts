import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models/property.models';
import { SavedSearch } from '../models/saved-search.models';

@Injectable({ providedIn: 'root' })
export class SavedSearchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/savedsearches`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<SavedSearch>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<SavedSearch>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<SavedSearch> {
    return this.http.get<SavedSearch>(`${this.baseUrl}/${id}`);
  }

  create(savedSearch: Partial<SavedSearch>): Observable<SavedSearch> {
    return this.http.post<SavedSearch>(this.baseUrl, savedSearch);
  }

  update(savedSearch: SavedSearch): Observable<SavedSearch> {
    return this.http.put<SavedSearch>(this.baseUrl, savedSearch);
  }

  delete(id: string): Observable<SavedSearch> {
    return this.http.delete<SavedSearch>(`${this.baseUrl}/${id}`);
  }
}
