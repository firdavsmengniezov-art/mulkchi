import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { ReviewResponse, ReviewSummary } from '../../../../../core/models/review.model';
import { ReviewService } from '../../../../../core/services/review.service';

@Component({
  selector: 'app-property-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-reviews.component.html',
  styleUrls: ['./property-reviews.component.scss'],
})
export class PropertyReviewsComponent implements OnInit {
  @Input() propertyId!: string;
  @Input() summary?: ReviewSummary;

  reviews: ReviewResponse[] = [];
  isLoading = true;
  readonly backendOrigin = environment.hubUrl;

  constructor(private reviewService: ReviewService) {}

  ngOnInit() {
    if (this.propertyId) {
      this.reviewService.getPropertyReviews(this.propertyId, 1, 6).subscribe({
        next: (res: any) => {
          this.reviews = res.items || [];
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
    }
  }

  ratingPercentage(score?: number): number {
    return ((score || 0) / 5) * 100;
  }

  getAvatarSrc(avatarUrl?: string | null): string {
    return avatarUrl ? `${this.backendOrigin}${avatarUrl}` : '/assets/images/user-placeholder.png';
  }
}
