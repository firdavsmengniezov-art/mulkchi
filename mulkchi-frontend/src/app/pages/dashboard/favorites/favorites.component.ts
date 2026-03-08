import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Favorite } from '../../../core/models/favorite.models';
import { Property } from '../../../core/models/property.models';
import { FavoriteService } from '../../../core/services/favorite.service';
import { PropertyService } from '../../../core/services/property.service';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface FavoriteWithProperty {
  favorite: Favorite;
  property: Property;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, PropertyCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="favorites-page">
      <div class="page-header">
        <h1>❤️ Sevimli mulklar</h1>
      </div>

      <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

      <ng-container *ngIf="!isLoading">
        <div class="favorites-grid" *ngIf="items.length > 0; else emptyTpl">
          <div class="favorite-item" *ngFor="let item of items">
            <app-property-card [property]="item.property"></app-property-card>
            <button class="btn-remove" (click)="removeFavorite(item)">
              🗑 Olib tashlash
            </button>
          </div>
        </div>

        <ng-template #emptyTpl>
          <div class="empty-state">
            <p>Hali sevimli mulklar yo'q.</p>
            <a routerLink="/properties" class="btn-gold">Mulklarni ko'rish →</a>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `,
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  private readonly favoriteService = inject(FavoriteService);
  private readonly propertyService = inject(PropertyService);

  items: FavoriteWithProperty[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;
    this.favoriteService.getAll(1, 50).pipe(
      switchMap((result) => {
        if (result.items.length === 0) return of([]);
        return forkJoin(
          result.items.map((fav) =>
            this.propertyService.getById(fav.propertyId).pipe(
              catchError(() => of(null))
            )
          )
        ).pipe(
          switchMap((properties) => {
            const combined: FavoriteWithProperty[] = result.items
              .map((fav, i) => ({ favorite: fav, property: properties[i] as Property }))
              .filter((item) => item.property != null);
            return of(combined);
          })
        );
      })
    ).subscribe({
      next: (items) => {
        this.items = items as FavoriteWithProperty[];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  removeFavorite(item: FavoriteWithProperty): void {
    this.favoriteService.delete(item.favorite.id).subscribe({
      next: () => this.loadFavorites(),
      error: () => {},
    });
  }
}
