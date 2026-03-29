import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Favorite, FavoriteToggleResult, PagedResult } from '../models/favorite.models';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private favoriteIds$ = new BehaviorSubject<Set<string>>(new Set());
  private favoritesCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  loadUserFavorites(): void {
    this.http.get<Favorite[]>(`${environment.apiUrl}/favorites`)
      .subscribe({
        next: (favorites) => {
          const ids = new Set(favorites.map(f => f.propertyId));
          this.favoriteIds$.next(ids);
          this.favoritesCount$.next(favorites.length);
        },
        error: (err) => {
          console.error('Failed to load favorites:', err);
        }
      });
  }

  getFavorites(pagination?: { page: number; pageSize: number }): Observable<PagedResult<Favorite>> {
    const params = pagination ? `?page=${pagination.page}&pageSize=${pagination.pageSize}` : '';
    return this.http.get<PagedResult<Favorite>>(`${environment.apiUrl}/favorites${params}`);
  }

  addFavorite(propertyId: string): Observable<Favorite> {
    return this.http.post<Favorite>(`${environment.apiUrl}/favorites`, { propertyId })
      .pipe(
        tap(() => {
          const ids = new Set(this.favoriteIds$.value);
          ids.add(propertyId);
          this.favoriteIds$.next(ids);
          this.favoritesCount$.next(this.favoritesCount$.value + 1);
        })
      );
  }

  removeFavorite(propertyId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/favorites/${propertyId}`)
      .pipe(
        tap(() => {
          const ids = new Set(this.favoriteIds$.value);
          ids.delete(propertyId);
          this.favoriteIds$.next(ids);
          this.favoritesCount$.next(Math.max(0, this.favoritesCount$.value - 1));
        })
      );
  }

  toggleFavorite(propertyId: string): Observable<FavoriteToggleResult> {
    const isFav = this.favoriteIds$.value.has(propertyId);
    if (isFav) {
      return this.removeFavorite(propertyId)
        .pipe(
          tap(() => {}),
          map(() => ({ isFavorited: false, favoritesCount: this.favoritesCount$.value }))
        );
    } else {
      return this.addFavorite(propertyId)
        .pipe(
          tap(() => {}),
          map(f => ({ isFavorited: true, favoritesCount: this.favoritesCount$.value }))
        );
    }
  }

  isFavorited(propertyId: string): Observable<boolean> {
    return this.favoriteIds$.pipe(map(ids => ids.has(propertyId)));
  }

  getFavoritesCount(): Observable<number> {
    return this.favoritesCount$.asObservable();
  }

  getFavoriteIds(): Observable<Set<string>> {
    return this.favoriteIds$.asObservable();
  }
}
