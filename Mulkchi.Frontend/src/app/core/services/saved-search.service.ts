import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SavedSearch, CreateSavedSearchRequest, SavedSearchResponse, SavedSearchesResponse } from '../models/saved-search.model';

@Injectable({
  providedIn: 'root'
})
export class SavedSearchService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all saved searches for current user
  getSavedSearches(page: number = 1, pageSize: number = 10): Observable<SavedSearchesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<SavedSearchesResponse>(`${this.apiUrl}/savedsearches`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Get saved search by ID
  getSavedSearchById(id: string): Observable<SavedSearchResponse> {
    return this.http.get<SavedSearchResponse>(`${this.apiUrl}/savedsearches/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create new saved search
  createSavedSearch(savedSearch: CreateSavedSearchRequest): Observable<SavedSearchResponse> {
    return this.http.post<SavedSearchResponse>(`${this.apiUrl}/savedsearches`, savedSearch).pipe(
      catchError(this.handleError)
    );
  }

  // Update saved search
  updateSavedSearch(id: string, savedSearch: CreateSavedSearchRequest): Observable<SavedSearchResponse> {
    return this.http.put<SavedSearchResponse>(`${this.apiUrl}/savedsearches/${id}`, savedSearch).pipe(
      catchError(this.handleError)
    );
  }

  // Toggle saved search active status
  toggleSavedSearch(id: string): Observable<SavedSearchResponse> {
    return this.http.put<SavedSearchResponse>(`${this.apiUrl}/savedsearches/${id}/toggle`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Delete saved search
  deleteSavedSearch(id: string): Observable<SavedSearchResponse> {
    return this.http.delete<SavedSearchResponse>(`${this.apiUrl}/savedsearches/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('SavedSearch API Error:', error);
    return throwError(() => error);
  }

  // Utility methods
  formatPropertyType(type?: string): string {
    if (!type) return 'Hammasi';
    
    const typeMap: { [key: string]: string } = {
      'Apartment': 'Kvartira',
      'House': 'Uy',
      'Villa': 'Villa',
      'Room': 'Xona',
      'Office': 'Ofis',
      'Land': 'Yer',
      'Commercial': 'Tijorat'
    };
    
    return typeMap[type] || type;
  }

  formatListingType(listingType?: string): string {
    if (!listingType) return 'Hammasi';
    
    const typeMap: { [key: string]: string } = {
      'Rent': 'Ijara',
      'Sale': 'Sotuv',
      'ShortTermRent': 'Kunlik ijara'
    };
    
    return typeMap[listingType] || listingType;
  }

  formatPrice(price?: number): string {
    if (!price) return 'Narx belgilanmagan';
    return `${price.toLocaleString()} so'm`;
  }

  formatArea(area?: number): string {
    if (!area) return 'Maydon belgilanmagan';
    return `${area} m²`;
  }

  getSearchSummary(savedSearch: SavedSearch): string {
    const parts: string[] = [];
    
    if (savedSearch.city) parts.push(`Shahar: ${savedSearch.city}`);
    if (savedSearch.type) parts.push(`Turi: ${this.formatPropertyType(savedSearch.type)}`);
    if (savedSearch.listingType) parts.push(`Sotish turi: ${this.formatListingType(savedSearch.listingType)}`);
    if (savedSearch.minPrice || savedSearch.maxPrice) {
      const priceRange = savedSearch.minPrice && savedSearch.maxPrice
        ? `${this.formatPrice(savedSearch.minPrice)} - ${this.formatPrice(savedSearch.maxPrice)}`
        : savedSearch.minPrice
        ? `dan ${this.formatPrice(savedSearch.minPrice)}`
        : `gacha ${this.formatPrice(savedSearch.maxPrice)}`;
      parts.push(`Narx: ${priceRange}`);
    }
    if (savedSearch.minArea || savedSearch.maxArea) {
      const areaRange = savedSearch.minArea && savedSearch.maxArea
        ? `${this.formatArea(savedSearch.minArea)} - ${this.formatArea(savedSearch.maxArea)}`
        : savedSearch.minArea
        ? `dan ${this.formatArea(savedSearch.minArea)}`
        : `gacha ${this.formatArea(savedSearch.maxArea)}`;
      parts.push(`Maydon: ${areaRange}`);
    }
    if (savedSearch.minBedrooms) parts.push(`Eng kam xonalar: ${savedSearch.minBedrooms}`);
    
    return parts.join(' | ');
  }

  isActiveStatus(isActive: boolean): string {
    return isActive ? 'Faol' : 'Faol emas';
  }

  getNotificationSettings(savedSearch: SavedSearch): string {
    const settings: string[] = [];
    
    if (savedSearch.notifyByEmail) settings.push('Email');
    if (savedSearch.notifyByPush) settings.push('Push');
    
    return settings.length > 0 ? settings.join(', ') : 'Bildirishlar o\'chirilgan';
  }
}
