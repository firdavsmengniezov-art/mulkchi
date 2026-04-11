import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Favorite, PagedResult } from '../../../core/models/favorite.models';
import { FavoriteService } from '../../../core/services/favorite.service';
import { LoggingService } from '../../../core/services/logging.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

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
    MatTooltipModule,
    NavbarComponent,
  ],
  templateUrl: './favorites-page.component.html',
  styleUrls: ['./favorites-page.component.scss'],
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
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.favoriteService
      .getFavorites({
        page: this.currentPage,
        pageSize: this.pageSize,
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
        },
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

    this.favoriteService.removeFavorite(favorite.propertyId).subscribe({
      next: () => {
        // Remove from local array
        this.favorites = this.favorites.filter((f) => f.id !== favorite.id);
        if (this.pagedResult) {
          this.pagedResult.items = this.favorites;
          this.pagedResult.totalCount = Math.max(0, this.pagedResult.totalCount - 1);
        }
      },
      error: (err) => {
        this.logger.error('Failed to remove favorite:', err);
      },
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
      { value: 'newest', label: "Yangi qo'shilgan" },
      { value: 'oldest', label: "Eski qo'shilgan" },
      { value: 'priceLow', label: 'Narxi kamayish' },
      { value: 'priceHigh', label: "Narxi o'sish" },
    ];
  }

  getSortLabel(): string {
    const option = this.getSortOptions().find((opt) => opt.value === this.sortBy);
    return option ? option.label : "Yangi qo'shilgan";
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
