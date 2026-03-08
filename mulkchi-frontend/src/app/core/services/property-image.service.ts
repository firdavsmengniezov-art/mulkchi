import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PropertyImage } from '../models/property-image.models';
import { PagedResult } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class PropertyImageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/propertyimages`;

  getAll(page = 1, pageSize = 20): Observable<PagedResult<PropertyImage>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<PropertyImage>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<PropertyImage> {
    return this.http.get<PropertyImage>(`${this.baseUrl}/${id}`);
  }

  create(image: Partial<PropertyImage>): Observable<PropertyImage> {
    return this.http.post<PropertyImage>(this.baseUrl, image);
  }

  update(image: PropertyImage): Observable<PropertyImage> {
    return this.http.put<PropertyImage>(this.baseUrl, image);
  }

  delete(id: string): Observable<PropertyImage> {
    return this.http.delete<PropertyImage>(`${this.baseUrl}/${id}`);
  }
}
