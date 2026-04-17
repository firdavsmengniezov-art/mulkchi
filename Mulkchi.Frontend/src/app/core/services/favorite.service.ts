import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { map, Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Favorite, FavoriteToggleResult, PagedResult } from '../models/favorite.models';
import { LoggingService } from './logging.service';

/**
 * Signal-based Favorite Service
 * Manages user favorites with reactive signals
 */
@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private logger = inject(LoggingService);

  // ============ STATE SIGNALS ============
  private readonly _favoriteIds = signal<Set<string>>(new Set());
  private readonly _favoritesCount = signal<number>(0);
  private readonly _favorites = signal<Favorite[]>([]);
  private readonly _loading = signal<boolean>(false);

  // ============ PUBLIC READABLE SIGNALS ============
  readonly favoriteIds = this._favoriteIds.asReadonly();
  readonly favoritesCount = this._favoritesCount.asReadonly();
  readonly favorites = this._favorites.asReadonly();
  readonly loading = this._loading.asReadonly();

  // ============ COMPUTED VALUES ============
  readonly hasFavorites = computed(() => this._favoritesCount() > 0);

  // ============ OBSERVABLE INTEROP (for backward compatibility) ============
  favoriteIds$ = toObservable(this._favoriteIds);
  favoritesCount$ = toObservable(this._favoritesCount);

  // Check if a specific property is favorited
  isFavorited(propertyId: string): boolean {
    return this._favoriteIds().has(propertyId);
  }

  loadUserFavorites(): void {
    this._loading.set(true);
    this.http.get<Favorite[]>(`${environment.apiUrl}/favorites`).subscribe({
      next: (favorites) => {
        const favoriteList = Array.isArray(favorites)
          ? favorites
          : Array.isArray((favorites as any)?.items)
            ? (favorites as any).items
            : [];

        const ids = new Set<string>(
          favoriteList.map((favorite: Favorite) => favorite.propertyId as string),
        );
        this._favoriteIds.set(ids);
        this._favoritesCount.set(favoriteList.length);
        this._favorites.set(favoriteList);
        this._loading.set(false);
      },
      error: (err) => {
        this._loading.set(false);
        // 401 is expected when user is not authenticated - not an error
        if (err.status === 401) {
          this.logger.log('Skipping favorites load: User not authenticated');
          return;
        }
        this.logger.error('Failed to load favorites:', err);
      },
    });
  }

  getFavorites(pagination?: { page: number; pageSize: number }): Observable<PagedResult<Favorite>> {
    const params = pagination ? `?page=${pagination.page}&pageSize=${pagination.pageSize}` : '';
    return this.http
      .get<PagedResult<Favorite>>(`${environment.apiUrl}/favorites${params}`)
      .pipe(catchError(this.handleError));
  }

  addFavorite(propertyId: string): Observable<Favorite> {
    return this.http.post<Favorite>(`${environment.apiUrl}/favorites`, { propertyId }).pipe(
      tap((favorite) => {
        const ids = new Set(this._favoriteIds());
        ids.add(propertyId);
        this._favoriteIds.set(ids);
        this._favoritesCount.update(count => count + 1);
        this._favorites.update(list => [...list, favorite]);
      }),
      catchError(this.handleError),
    );
  }

  removeFavorite(propertyId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/favorites/${propertyId}`).pipe(
      tap(() => {
        const ids = new Set(this._favoriteIds());
        ids.delete(propertyId);
        this._favoriteIds.set(ids);
        this._favoritesCount.update(count => Math.max(0, count - 1));
        this._favorites.update(list => list.filter(f => f.propertyId !== propertyId));
      }),
      catchError(this.handleError),
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    // Don't treat 401 as error - it's expected for unauthenticated users
    if (error.status === 401) {
      this.logger.log('Favorite API: User not authenticated');
      return throwError(() => error);
    }
    this.logger.error('Favorite API Error:', error);
    return throwError(() => error);
  }

  toggleFavorite(propertyId: string): Observable<FavoriteToggleResult> {
    const isFav = this.isFavorited(propertyId);
    if (isFav) {
      return this.removeFavorite(propertyId).pipe(
        map(() => ({ isFavorited: false, favoritesCount: this._favoritesCount() })),
      );
    } else {
      return this.addFavorite(propertyId).pipe(
        map((f) => ({ isFavorited: true, favoritesCount: this._favoritesCount() })),
      );
    }
  }

  getFavoritesCount(): Observable<number> {
    return this.favoritesCount$;
  }

  getFavoriteIds(): Observable<Set<string>> {
    return this.favoriteIds$;
  }
}
