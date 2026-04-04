import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property, PropertySearchParams, PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {}

  getProperties(page = 1, size = 10): Observable<PagedResult<Property>> {
    const params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', size.toString());
    return this.http.get<PagedResult<Property>>(this.apiUrl, { params });
  }

  searchProperties(params: PropertySearchParams): Observable<PagedResult<Property>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<PagedResult<Property>>(`${this.apiUrl}/search`, { params: httpParams });
  }

  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  createProperty(data: Partial<Property>): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, data);
  }

  updateProperty(id: string, data: Partial<Property>): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, data);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
