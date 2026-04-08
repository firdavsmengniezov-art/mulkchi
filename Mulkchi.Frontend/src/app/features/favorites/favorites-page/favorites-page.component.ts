import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FavoriteService } from '../../../core/services/favorite.service';
import { Favorite, PagedResult } from '../../../core/models/favorite.models';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './favorites-page.component.html',
  styleUrls: ['./favorites-page.component.scss']
})
export class FavoritesPageComponent implements OnInit, OnDestroy {
  favorites: Favorite[] = [];
  pagedResult: PagedResult<Favorite> | null = null;
  loading = true;
  currentPage = 1;
  pageSize = 12;
  sortBy = 'newest'; // newest, oldest, priceLow, priceHigh

  private destroy$ = new Subject<void>();

  constructor(
    private favoriteService: FavoriteService,
    private router: Router,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.favoriteService.getFavorites({
      page: this.currentPage,
      pageSize: this.pageSize
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.pagedResult = result;
          this.favorites = result.items;
          this.loading = false;
        },
        error: (err) => {
          this.logger.error('Failed to load favorites:', err);
          this.loading = false;
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.loadFavorites();
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.currentPage = 1;
    this.loadFavorites();
  }

  removeFavorite(favorite: Favorite, event: Event): void {
    event.stopPropagation();
    
    this.favoriteService.removeFavorite(favorite.propertyId)
      .subscribe({
        next: () => {
          // Remove from local array
          this.favorites = this.favorites.filter(f => f.id !== favorite.id);
          if (this.pagedResult) {
            this.pagedResult.items = this.favorites;
            this.pagedResult.totalCount = Math.max(0, this.pagedResult.totalCount - 1);
          }
        },
        error: (err) => {
          this.logger.error('Failed to remove favorite:', err);
        }
      });
  }

  goToProperty(propertyId: string): void {
    this.router.navigate(['/properties', propertyId]);
  }

  goToProperties(): void {
    this.router.navigate(['/properties']);
  }

  getSortOptions(): { value: string; label: string }[] {
    return [
      { value: 'newest', label: 'Yangi qo\'shilgan' },
      { value: 'oldest', label: 'Eski qo\'shilgan' },
      { value: 'priceLow', label: 'Narxi kamayish' },
      { value: 'priceHigh', label: 'Narxi o\'sish' }
    ];
  }

  getSortLabel(): string {
    const option = this.getSortOptions().find(opt => opt.value === this.sortBy);
    return option ? option.label : 'Yangi qo\'shilgan';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
