import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Favorite } from '../models/favorite.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/favorites`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<Favorite>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Favorite>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Favorite> {
    return this.http.get<Favorite>(`${this.baseUrl}/${id}`);
  }

  create(favorite: Partial<Favorite>): Observable<Favorite> {
    return this.http.post<Favorite>(this.baseUrl, favorite);
  }

  delete(id: string): Observable<Favorite> {
    return this.http.delete<Favorite>(`${this.baseUrl}/${id}`);
  }
}
