import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorites`;
  
  constructor(private http: HttpClient) {}

  getFavorites(): Observable<PagedResult<any>> { 
    return this.http.get<PagedResult<any>>(this.apiUrl); 
  }

  addFavorite(propertyId: string): Observable<any> { 
    return this.http.post(this.apiUrl, { propertyId }); 
  }

  removeFavorite(id: string): Observable<void> { 
    return this.http.delete<void>(`${this.apiUrl}/${id}`); 
  }
}
