import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stars">
      <mat-icon
        *ngFor="let star of stars"
        [class.filled]="star <= displayRating"
        [class.half]="star - 0.5 === displayRating"
        (click)="readonly ? null : onStarClick(star)"
        (mouseover)="readonly ? null : onHover(star)"
        (mouseleave)="readonly ? null : onLeave()"
        [style.cursor]="readonly ? 'default' : 'pointer'"
        matTooltip="readonly ? null : star + ' yulduz'">
        {{ getStarIcon(star) }}
      </mat-icon>
      <span *ngIf="showValue" class="rating-value">
        {{ rating | number:'1.1-1' }}
      </span>
    </div>
  `,
  styles: [`
    .stars { 
      display: flex; 
      align-items: center; 
      gap: 2px; 
    }
    mat-icon { 
      font-size: 20px; 
      width: 20px; 
      height: 20px; 
      color: #ddd; 
      transition: color 0.1s; 
    }
    mat-icon.filled { 
      color: #FFB300; 
    }
    mat-icon.half { 
      color: #FFB300; 
      opacity: 0.7;
    }
    .rating-value { 
      font-size: 14px; 
      color: var(--color-text-secondary); 
      margin-left: 6px; 
    }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() readonly: boolean = true;
  @Input() showValue: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];
  hoverRating = 0;

  get displayRating(): number {
    return this.hoverRating || this.rating;
  }

  getStarIcon(star: number): string {
    if (star <= this.displayRating) return 'star';
    if (star - 0.5 <= this.displayRating) return 'star_half';
    return 'star_border';
  }

  onStarClick(star: number): void {
    this.rating = star;
    this.ratingChange.emit(star);
  }

  onHover(star: number): void { 
    this.hoverRating = star; 
  }
  
  onLeave(): void { 
    this.hoverRating = 0; 
  }
}
