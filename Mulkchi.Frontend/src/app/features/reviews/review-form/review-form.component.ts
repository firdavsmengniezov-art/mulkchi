import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ReviewService } from '../../../core/services/review.service';
import { CreateReviewRequest, Review } from '../../../core/models/review.model';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

export interface ReviewFormDialogData {
  propertyId: string;
  existingReview?: Review;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    StarRatingComponent
  ],
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss']
})
export class ReviewFormComponent implements OnInit {
  reviewForm!: FormGroup;
  isLoading = false;
  isEditMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    public dialogRef: MatDialogRef<ReviewFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewFormDialogData
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.existingReview;
    
    this.reviewForm = this.fb.group({
      overallRating: [this.data.existingReview?.overallRating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      cleanlinessRating: [this.data.existingReview?.cleanlinessRating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      locationRating: [this.data.existingReview?.locationRating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      valueRating: [this.data.existingReview?.valueRating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      communicationRating: [this.data.existingReview?.communicationRating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      accuracyRating: [this.data.existingReview?.accuracyRating || 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [this.data.existingReview?.comment || '', [Validators.required, Validators.minLength(10)]]
    });
  }

  onRatingChange(ratingType: string, value: number): void {
    this.reviewForm.patchValue({ [ratingType]: value });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.reviewForm.value;

    const request: CreateReviewRequest = {
      propertyId: this.data.propertyId,
      overallRating: formValue.overallRating,
      cleanlinessRating: formValue.cleanlinessRating,
      locationRating: formValue.locationRating,
      valueRating: formValue.valueRating,
      communicationRating: formValue.communicationRating,
      accuracyRating: formValue.accuracyRating,
      comment: formValue.comment
    };

    const observable = this.isEditMode 
      ? this.reviewService.updateReview(this.data.existingReview!.id, request)
      : this.reviewService.createReview(request);

    observable
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (review) => {
          this.dialogRef.close(review);
        },
        error: (err) => {
          console.error('Failed to save review:', err);
        }
      });
  }

  getErrorMessage(controlName: string): string {
    const control = this.reviewForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return 'Bu maydon to\'ldirilishi shart';
      if (control.errors['min']) return 'Minimal 1';
      if (control.errors['max']) return 'Maksimal 5';
      if (control.errors['minlength']) return `Minimal ${control.errors['minlength'].requiredLength} ta belgi`;
    }
    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

