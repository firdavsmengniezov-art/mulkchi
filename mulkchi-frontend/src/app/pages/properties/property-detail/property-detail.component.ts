import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PropertyService } from '../../../core/services/property.service';
import { ReviewService } from '../../../core/services/review.service';
import { HomeRequestService } from '../../../core/services/home-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property } from '../../../core/models/property.models';
import { Review } from '../../../core/models/review.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatSnackBarModule, LoadingSpinnerComponent],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly reviewService = inject(ReviewService);
  private readonly homeRequestService = inject(HomeRequestService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  property: Property | null = null;
  reviews: Review[] = [];
  isLoading = true;
  isRequestLoading = false;
  isLoggedIn = false;

  requestForm: FormGroup = this.fb.group({
    checkInDate: ['', [Validators.required]],
    checkOutDate: ['', [Validators.required]],
    guestCount: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProperty(id);
    }
  }

  loadProperty(id: string): void {
    this.propertyService.getById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.isLoading = false;
        this.loadReviews();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadReviews(): void {
    this.reviewService.getAll(1, 5).subscribe({
      next: (result) => {
        this.reviews = result.items;
      },
      error: () => {}
    });
  }

  getPrice(): string {
    if (!this.property) return '';
    if (this.property.listingType === 'Sale') return `${(this.property.salePrice ?? 0).toLocaleString()} UZS`;
    if (this.property.listingType === 'ShortTermRent') return `${(this.property.pricePerNight ?? 0).toLocaleString()} UZS/kecha`;
    return `${(this.property.monthlyRent ?? 0).toLocaleString()} UZS/oy`;
  }

  submitRequest(): void {
    if (this.requestForm.invalid || !this.property) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isRequestLoading = true;
    const userId = this.authService.getUserId();

    this.homeRequestService.create({
      propertyId: this.property.id,
      guestId: userId ?? '',
      hostId: this.property.hostId,
      checkInDate: this.requestForm.value.checkInDate,
      checkOutDate: this.requestForm.value.checkOutDate,
      guestCount: this.requestForm.value.guestCount
    }).subscribe({
      next: () => {
        this.isRequestLoading = false;
        this.snackBar.open('So\'rovingiz yuborildi!', 'Yopish', { duration: 3000 });
        this.requestForm.reset({ guestCount: 1 });
      },
      error: () => {
        this.isRequestLoading = false;
        this.snackBar.open('Xatolik yuz berdi', 'Yopish', { duration: 3000 });
      }
    });
  }
}
