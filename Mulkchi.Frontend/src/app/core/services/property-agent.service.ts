import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResult, Property, PropertySearchParams } from '../models';
import { LoggingService } from './logging.service';

/**
 * Signal-based Property Agent Service
 * Provides reactive state management for properties using Angular Signals
 */
@Injectable({ providedIn: 'root' })
export class PropertyAgent {
  private http = inject(HttpClient);
  private logger = inject(LoggingService);
  private apiUrl = `${environment.apiUrl}/properties`;

  // ============ STATE SIGNALS ============
  readonly properties = signal<Property[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly selectedProperty = signal<Property | null>(null);
  readonly featuredProperties = signal<Property[]>([]);
  readonly similarProperties = signal<Property[]>([]);

  // ============ PAGINATION STATE ============
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(9);
  readonly totalCount = signal<number>(0);
  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  readonly hasNextPage = computed(() => this.currentPage() < this.totalPages());
  readonly hasPreviousPage = computed(() => this.currentPage() > 1);

  // ============ FILTER STATE ============
  readonly searchQuery = signal<string>('');
  readonly selectedCity = signal<string>('');
  readonly selectedType = signal<string>('');
  readonly selectedListingType = signal<string>('');
  readonly priceRange = signal<{ min: number; max: number }>({ min: 0, max: 1000000 });
  readonly sortBy = signal<string>('newest'); // newest, price_asc, price_desc, rating

  // ============ COMPUTED VALUES ============
  readonly filteredProperties = computed(() => {
    let result = this.properties();
    const query = this.searchQuery().toLowerCase();

    if (query) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
      );
    }

    if (this.selectedCity()) {
      result = result.filter(p => p.city === this.selectedCity());
    }

    if (this.selectedType()) {
      result = result.filter(p => p.type === this.selectedType());
    }

    if (this.selectedListingType()) {
      result = result.filter(p => p.listingType === this.selectedListingType());
    }

    // Price filter
    const { min, max } = this.priceRange();
    result = result.filter(p => {
      const price = p.listingType === 'Rent' ? (p.monthlyRent || 0) : (p.salePrice || 0);
      return price >= min && price <= max;
    });

    // Sort
    const sort = this.sortBy();
    return [...result].sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return (a.monthlyRent || a.salePrice || 0) - (b.monthlyRent || b.salePrice || 0);
        case 'price_desc':
          return (b.monthlyRent || b.salePrice || 0) - (a.monthlyRent || a.salePrice || 0);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'newest':
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
    });
  });

  readonly propertiesCount = computed(() => this.properties().length);
  readonly filteredCount = computed(() => this.filteredProperties().length);

  // ============ ACTION SUBJECTS ============
  private searchTrigger$ = new Subject<PropertySearchParams>();

  constructor() {
    // Setup reactive search with debounce
    this.searchTrigger$.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      tap(() => this.loading.set(true)),
      switchMap(params => this.searchPropertiesInternal(params)),
      catchError((err) => {
        this.error.set(err.message);
        this.loading.set(false);
        return throwError(() => err);
      })
    ).subscribe({
      next: (result) => {
        this.properties.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.logger.error('Search failed:', err);
      }
    });
  }

  // ============ ACTIONS ============
  loadProperties(page = 1, size = 9): void {
    this.loading.set(true);
    this.error.set(null);
    this.currentPage.set(page);
    this.pageSize.set(size);

    this.http.get<PagedResult<Property>>(
      `${this.apiUrl}?pageNumber=${page}&pageSize=${size}`
    ).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (result) => {
        this.properties.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
        this.logger.error('Failed to load properties:', err);
      }
    });
  }

  search(params: PropertySearchParams): void {
    this.searchTrigger$.next(params);
  }

  loadProperty(id: string): void {
    this.loading.set(true);
    this.http.get<Property>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (property) => {
        this.selectedProperty.set(property);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
        this.logger.error('Failed to load property:', err);
      }
    });
  }

  loadFeaturedProperties(count = 8): void {
    this.http.get<Property[]>(
      `${this.apiUrl}/featured`,
      { params: { count: count.toString() } }
    ).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (properties) => {
        this.featuredProperties.set(properties);
      },
      error: (err) => {
        this.logger.error('Failed to load featured properties:', err);
      }
    });
  }

  loadSimilarProperties(id: string, count = 6): void {
    this.http.get<Property[]>(
      `${this.apiUrl}/${id}/similar`,
      { params: { count: count.toString() } }
    ).pipe(
      catchError(this.handleError)
    ).subscribe({
      next: (properties) => {
        this.similarProperties.set(properties);
      },
      error: (err) => {
        this.logger.error('Failed to load similar properties:', err);
      }
    });
  }

  // ============ FILTER ACTIONS ============
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setCity(city: string): void {
    this.selectedCity.set(city);
  }

  setType(type: string): void {
    this.selectedType.set(type);
  }

  setListingType(listingType: string): void {
    this.selectedListingType.set(listingType);
  }

  setPriceRange(min: number, max: number): void {
    this.priceRange.set({ min, max });
  }

  setSortBy(sort: string): void {
    this.sortBy.set(sort);
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.loadProperties(this.currentPage() + 1, this.pageSize());
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.loadProperties(this.currentPage() - 1, this.pageSize());
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCity.set('');
    this.selectedType.set('');
    this.selectedListingType.set('');
    this.priceRange.set({ min: 0, max: 1000000 });
    this.sortBy.set('newest');
  }

  // ============ INTERNAL ============
  private searchPropertiesInternal(params: PropertySearchParams): Observable<PagedResult<Property>> {
    let query = Object.entries(params)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    return this.http.get<PagedResult<Property>>(`${this.apiUrl}/search?${query}`);
  }

  private handleError = (error: HttpErrorResponse) => {
    this.logger.error('Property Agent Error:', error);
    return throwError(() => error);
  }
}
