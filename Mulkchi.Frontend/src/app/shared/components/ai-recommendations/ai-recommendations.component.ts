import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AiRecommendationService } from '../../../core/services/ai-recommendation.service';
import { AiRecommendation, RecommendationType } from '../../../core/models/ai-recommendation.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-recommendations.component.html',
  styleUrls: ['./ai-recommendations.component.scss']
})
export class AiRecommendationsComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Siz uchun maxsus tavsiyalar';
  @Input() type: RecommendationType | null = null;
  @Input() propertyId: string | null = null;
  @Input() limit: number = 10;
  @Input() showViewAll: boolean = true;
  @Input() autoLoad: boolean = true;

  recommendations: AiRecommendation[] = [];
  loading = false;
  error = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private aiRecommendationService: AiRecommendationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.autoLoad) {
      this.loadRecommendations();
    }
  }

  loadRecommendations(): void {
    this.loading = true;
    this.error = '';

    let observable;
    
    if (this.propertyId) {
      // Get similar properties for a specific property
      observable = this.aiRecommendationService.getSimilarProperties(this.propertyId, this.limit);
    } else if (this.type) {
      // Get recommendations by type
      observable = this.aiRecommendationService.getRecommendations({
        recommendationType: this.type,
        limit: this.limit,
        includeViewed: false,
        includeClicked: false
      });
    } else {
      // Get personalized recommendations
      observable = this.aiRecommendationService.getPersonalizedRecommendations(this.limit);
    }

    const subscription = observable.subscribe({
      next: (recommendations) => {
        this.recommendations = recommendations;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Tavsiyalarni yuklashda xatolik';
        console.error('Error loading recommendations:', err);
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  onViewRecommendation(recommendation: AiRecommendation): void {
    // Track view
    this.aiRecommendationService.trackRecommendationView(recommendation.id).subscribe({
      error: (err) => console.error('Error tracking view:', err)
    });

    // Mark as viewed locally
    recommendation.isViewed = true;

    // Navigate to property detail
    this.router.navigate(['/properties', recommendation.property.id]);
  }

  onPropertyClick(propertyId: string, recommendation: AiRecommendation): void {
    // Track click
    this.aiRecommendationService.trackRecommendationClick(recommendation.id).subscribe({
      error: (err) => console.error('Error tracking click:', err)
    });

    // Mark as clicked locally
    recommendation.isClicked = true;

    // Navigate to property detail
    this.router.navigate(['/properties', propertyId]);
  }

  onViewAll(): void {
    if (this.type) {
      this.router.navigate(['/recommendations'], { queryParams: { type: this.type } });
    } else {
      this.router.navigate(['/recommendations']);
    }
  }

  refreshRecommendations(): void {
    this.loadRecommendations();
  }

  // Helper methods
  getRecommendationTypeLabel(type: RecommendationType): string {
    return this.aiRecommendationService.getRecommendationTypeLabel(type);
  }

  getRecommendationTypeColor(type: RecommendationType): string {
    return this.aiRecommendationService.getRecommendationTypeColor(type);
  }

  formatScore(score: number): string {
    return this.aiRecommendationService.formatScore(score);
  }

  getScoreColor(score: number): string {
    return this.aiRecommendationService.getScoreColor(score);
  }

  formatPrice(price: number): string {
    return `UZS ${price.toLocaleString('uz-UZ')}`;
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  getRecommendationImage(recommendation: AiRecommendation): string {
    return recommendation.property.imageUrl || '/assets/images/placeholder-property.jpg';
  }

  isHighScore(score: number): boolean {
    return this.aiRecommendationService.isHighScore(score);
  }

  // Check if recommendations are empty
  get isEmpty(): boolean {
    return !this.loading && !this.error && this.recommendations.length === 0;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
