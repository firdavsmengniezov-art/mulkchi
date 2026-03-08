import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult, Property, PropertyFilter } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/properties`;

  getAll(filter: PropertyFilter = {}): Observable<PagedResult<Property>> {
    let params = new HttpParams();
    if (filter.city) params = params.set('city', filter.city);
    if (filter.region) params = params.set('region', filter.region);
    if (filter.minPrice != null) params = params.set('minPrice', filter.minPrice);
    if (filter.maxPrice != null) params = params.set('maxPrice', filter.maxPrice);
    if (filter.bedrooms != null) params = params.set('bedrooms', filter.bedrooms);
    if (filter.listingType) params = params.set('listingType', filter.listingType);
    if (filter.page != null) params = params.set('page', filter.page);
    if (filter.pageSize != null) params = params.set('pageSize', filter.pageSize);
    return this.http.get<PagedResult<Property>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.baseUrl}/${id}`);
  }

  create(property: Partial<Property>): Observable<Property> {
    return this.http.post<Property>(this.baseUrl, property);
  }

  update(property: Property): Observable<Property> {
    return this.http.put<Property>(this.baseUrl, property);
  }

  delete(id: string): Observable<Property> {
    return this.http.delete<Property>(`${this.baseUrl}/${id}`);
  }
}
