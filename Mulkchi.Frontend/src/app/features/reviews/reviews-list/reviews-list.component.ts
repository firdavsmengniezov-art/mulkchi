import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ReviewService } from '../../../core/services/review.service';
import { Review, ReviewSummary, PagedResult } from '../../../core/models/review.model';
import { ReviewFormComponent, ReviewFormDialogData } from '../review-form/review-form.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [
    CommonModule,
    KeyValuePipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    StarRatingComponent
  ],
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.scss']
})
export class ReviewsListComponent implements OnInit, OnDestroy {
  @Input() propertyId: string = '';
  @Input() showAddButton: boolean = true;

  reviews: Review[] = [];
  reviewSummary: ReviewSummary | null = null;
  loading = true;
  currentPage = 1;
  pageSize = 5;
  totalCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private reviewService: ReviewService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    if (this.propertyId) {
      this.loadReviewSummary();
    }
  }

  loadReviews(): void {
    this.loading = true;
    
    const observable = this.propertyId 
      ? this.reviewService.getPropertyReviews(this.propertyId, this.currentPage, this.pageSize)
      : this.reviewService.getMyReviews(this.currentPage, this.pageSize);

    observable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: PagedResult<Review>) => {
          this.reviews = result.items;
          this.totalCount = result.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load reviews:', err);
          this.loading = false;
        }
      });
  }

  loadReviewSummary(): void {
    if (!this.propertyId) return;

    this.reviewService.getReviewSummary(this.propertyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.reviewSummary = summary;
        },
        error: (err) => {
          console.error('Failed to load review summary:', err);
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.loadReviews();
  }

  openReviewForm(review?: Review): void {
    if (!this.propertyId) return;

    const dialogRef = this.dialog.open(ReviewFormComponent, {
      width: '600px',
      data: {
        propertyId: this.propertyId,
        existingReview: review
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.loadReviews();
          this.loadReviewSummary();
        }
      });
  }

  editReview(review: Review, event: Event): void {
    event.stopPropagation();
    this.openReviewForm(review);
  }

  deleteReview(review: Review, event: Event): void {
    event.stopPropagation();
    
    if (!confirm('Ushbu sharhni o\'chirishni tasdiqlaysizmi?')) return;

    this.reviewService.deleteReview(review.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadReviews();
          this.loadReviewSummary();
        },
        error: (err) => {
          console.error('Failed to delete review:', err);
        }
      });
  }

  formatDate(date: Date): string {
    return this.reviewService.formatDate(date);
  }

  getRatingPercentage(stars: number): number {
    if (!this.reviewSummary || this.reviewSummary.totalReviews === 0) return 0;
    return (stars / this.reviewSummary.totalReviews) * 100;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

