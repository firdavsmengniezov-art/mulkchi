import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Property, ListingType, PropertyType, PropertyCategory } from '../interfaces/property.interface';
import { PagedResult } from '../interfaces/common.interface';

export interface PropertySearchRequest {
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  listingType?: ListingType;
  propertyType?: PropertyType;
  propertyCategory?: PropertyCategory;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(private apiService: ApiService) {}

  getProperties(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<Property>> {
    return this.apiService.get<PagedResult<Property>>(`/properties?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  searchProperties(searchRequest: PropertySearchRequest): Observable<PagedResult<Property>> {
    const params = new URLSearchParams();
    
    if (searchRequest.region) params.append('region', searchRequest.region);
    if (searchRequest.minPrice) params.append('minPrice', searchRequest.minPrice.toString());
    if (searchRequest.maxPrice) params.append('maxPrice', searchRequest.maxPrice.toString());
    if (searchRequest.bedrooms) params.append('bedrooms', searchRequest.bedrooms.toString());
    if (searchRequest.listingType !== undefined) params.append('listingType', searchRequest.listingType.toString());
    if (searchRequest.propertyType !== undefined) params.append('propertyType', searchRequest.propertyType.toString());
    if (searchRequest.propertyCategory !== undefined) params.append('propertyCategory', searchRequest.propertyCategory.toString());
    if (searchRequest.pageNumber) params.append('pageNumber', searchRequest.pageNumber.toString());
    if (searchRequest.pageSize) params.append('pageSize', searchRequest.pageSize.toString());

    return this.apiService.get<PagedResult<Property>>(`/properties/search?${params}`);
  }

  getPropertyById(id: string): Observable<Property> {
    return this.apiService.get<Property>(`/properties/${id}`);
  }

  createProperty(property: Partial<Property>): Observable<Property> {
    return this.apiService.post<Property>('/properties', property, true);
  }

  updateProperty(id: string, property: Partial<Property>): Observable<Property> {
    return this.apiService.put<Property>(`/properties/${id}`, property, true);
  }

  deleteProperty(id: string): Observable<void> {
    return this.apiService.delete<void>(`/properties/${id}`, true);
  }
}
