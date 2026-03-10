import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property, PropertySearchParams, PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;
  
  constructor(private http: HttpClient) {}

  getProperties(page = 1, size = 10): Observable<PagedResult<Property>> {
    return this.http.get<PagedResult<Property>>(`${this.apiUrl}?pageNumber=${page}&pageSize=${size}`);
  }

  searchProperties(params: PropertySearchParams): Observable<PagedResult<Property>> {
    let query = Object.entries(params).filter(([,v]) => v != null)
      .map(([k,v]) => `${k}=${v}`).join('&');
    return this.http.get<PagedResult<Property>>(`${this.apiUrl}/search?${query}`);
  }

  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  createProperty(data: any): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, data);
  }

  updateProperty(id: string, data: any): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, data);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
