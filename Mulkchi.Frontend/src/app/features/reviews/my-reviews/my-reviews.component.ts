import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ReviewService } from '../../../core/services/review.service';
import { Review, PagedResult } from '../../../core/models/review.model';
import { ReviewFormComponent, ReviewFormDialogData } from '../review-form/review-form.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    StarRatingComponent
  ],
  templateUrl: './my-reviews.component.html',
  styleUrls: ['./my-reviews.component.scss']
})
export class MyReviewsComponent implements OnInit, OnDestroy {
  reviews: Review[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  activeTab = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMyReviews();
  }

  loadMyReviews(): void {
    this.loading = true;
    
    this.reviewService.getMyReviews(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: PagedResult<Review>) => {
          this.reviews = result.items;
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load my reviews:', err);
          this.loading = false;
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.loadMyReviews();
  }

  editReview(review: Review, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ReviewFormComponent, {
      width: '600px',
      data: {
        propertyId: review.propertyId,
        existingReview: review
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.loadMyReviews();
        }
      });
  }

  deleteReview(review: Review, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Ushbu sharhni o\'chirishni tasdiqlaysizmi?')) return;

    this.reviewService.deleteReview(review.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadMyReviews();
        },
        error: (err) => {
          console.error('Failed to delete review:', err);
        }
      });
  }

  formatDate(date: Date): string {
    return this.reviewService.formatDate(date);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

