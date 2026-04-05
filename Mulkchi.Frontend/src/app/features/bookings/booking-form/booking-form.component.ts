import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateBookingRequest } from '../../../core/models/booking.model';
import {
  DiscountValidationRequest,
  DiscountValidationResponse,
} from '../../../core/models/discount.model';
import { Property } from '../../../core/models/property.model';
import { BookingService } from '../../../core/services/booking.service';
import { DiscountService } from '../../../core/services/discount.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="booking-form" *ngIf="property">
      <h3>Bron qilish</h3>

      <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="checkInDate">Kirish sanasi</label>
          <input
            type="date"
            id="checkInDate"
            formControlName="checkInDate"
            [min]="minDate"
            class="form-control"
          />
          <div
            class="error"
            *ngIf="
              bookingForm.get('checkInDate')?.invalid && bookingForm.get('checkInDate')?.touched
            "
          >
            Kirish sanasini tanlang
          </div>
        </div>

        <div class="form-group">
          <label for="checkOutDate">Chiqish sanasi</label>
          <input
            type="date"
            id="checkOutDate"
            formControlName="checkOutDate"
            [min]="bookingForm.get('checkInDate')?.value || minDate"
            class="form-control"
          />
          <div
            class="error"
            *ngIf="
              bookingForm.get('checkOutDate')?.invalid && bookingForm.get('checkOutDate')?.touched
            "
          >
            Chiqish sanasini tanlang
          </div>
        </div>

        <div class="form-group">
          <label for="guestsCount">Mehmonlar soni</label>
          <input
            type="number"
            id="guestsCount"
            formControlName="guestsCount"
            [min]="1"
            [max]="property.maxGuests || 10"
            class="form-control"
          />
          <div
            class="error"
            *ngIf="
              bookingForm.get('guestsCount')?.invalid && bookingForm.get('guestsCount')?.touched
            "
          >
            Mehmonlar sonini kiriting (1-{{ property.maxGuests || 10 }})
          </div>
        </div>

        <div class="form-group">
          <label for="notes">Izoh (ixtiyoriy)</label>
          <textarea
            id="notes"
            formControlName="notes"
            rows="3"
            class="form-control"
            placeholder="Qo'shimcha ma'lumot..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="promoCode">Promo kodi (ixtiyoriy)</label>
          <div class="promo-code-input">
            <input
              type="text"
              id="promoCode"
              formControlName="promoCode"
              class="form-control"
              placeholder="Promo kodni kiriting"
            />
            <button
              type="button"
              class="btn btn-outline"
              (click)="applyPromoCode()"
              [disabled]="!promoCodeValue || isValidatingDiscount || !!appliedDiscount"
            >
              {{
                isValidatingDiscount
                  ? 'Tekshirilmoqda...'
                  : appliedDiscount
                    ? "Qo'llanilgan"
                    : "Qo'llash"
              }}
            </button>
            <button
              type="button"
              class="btn btn-outline btn-remove"
              (click)="removePromoCode()"
              *ngIf="appliedDiscount"
            >
              ?
            </button>
          </div>
          <div class="discount-message success" *ngIf="appliedDiscount">
            ? Promo kod qo'llanildi: {{ appliedDiscount.discount?.code }} -
            {{ getDiscountDisplay() }}
          </div>
          <div class="discount-message error" *ngIf="discountError">? {{ discountError }}</div>
        </div>

        <div class="price-summary" *ngIf="totalPrice > 0">
          <div class="price-row">
            <span>Narx bir kechaga:</span>
            <span>{{ property.pricePerNight | number }} so'm</span>
          </div>
          <div class="price-row">
            <span>Kechalar soni:</span>
            <span>{{ numberOfNights }}</span>
          </div>
          <div
            class="price-row original-price"
            *ngIf="appliedDiscount && originalPrice > finalPrice"
          >
            <span>Asl narx:</span>
            <span class="strikethrough">{{ originalPrice | number }} so'm</span>
          </div>
          <div class="price-row discount" *ngIf="appliedDiscount && discountAmount > 0">
            <span>Chegirma:</span>
            <span class="discount-amount">-{{ discountAmount | number }} so'm</span>
          </div>
          <div class="price-row total">
            <span>Jami narx:</span>
            <span class="final-price">{{ finalPrice | number }} so'm</span>
          </div>
        </div>

        <div class="instant-book-badge" *ngIf="property.isInstantBook">? Darhol bron</div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="bookingForm.invalid || isLoading"
          >
            {{
              isLoading
                ? 'Yuborilmoqda...'
                : property.isInstantBook
                  ? 'Darhol bron'
                  : "So'rov yuborish"
            }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Bekor qilish</button>
        </div>
      </form>

      <div class="alert alert-success" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="alert alert-error" *ngIf="errorMessage">{{ errorMessage }}</div>
    </div>
  `,
  styleUrls: ['./booking-form.component.scss'],
})
export class BookingFormComponent implements OnInit {
  @Input() property!: Property;
  @Output() bookingCreated = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  bookingForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  minDate = new Date().toISOString().split('T')[0];
  totalPrice = 0;
  numberOfNights = 0;

  isValidatingDiscount = false;
  appliedDiscount: DiscountValidationResponse | null = null;
  discountError = '';
  originalPrice = 0;
  finalPrice = 0;
  discountAmount = 0;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private discountService: DiscountService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      propertyId: [this.property?.id || '', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      guestsCount: [
        1,
        [Validators.required, Validators.min(1), Validators.max(this.property.maxGuests || 10)],
      ],
      notes: [''],
      promoCode: [''],
    });

    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => this.calculatePrice());
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => this.calculatePrice());
  }

  calculatePrice(): void {
    const checkInDate = this.bookingForm.get('checkInDate')?.value;
    const checkOutDate = this.bookingForm.get('checkOutDate')?.value;
    const pricePerNight = this.property.pricePerNight || 0;

    if (checkInDate && checkOutDate && pricePerNight > 0) {
      this.originalPrice = this.bookingService.calculateTotalPrice(
        checkInDate,
        checkOutDate,
        pricePerNight,
      );

      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      this.numberOfNights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (this.appliedDiscount && this.appliedDiscount.discountAmount) {
        this.discountAmount = this.appliedDiscount.discountAmount;
        this.finalPrice = Math.max(0, this.originalPrice - this.discountAmount);
      } else {
        this.discountAmount = 0;
        this.finalPrice = this.originalPrice;
      }
      this.totalPrice = this.finalPrice;
    } else {
      this.originalPrice = 0;
      this.finalPrice = 0;
      this.discountAmount = 0;
      this.totalPrice = 0;
      this.numberOfNights = 0;
    }
  }

  get promoCodeValue(): string {
    return this.bookingForm.get('promoCode')?.value?.trim() || '';
  }

  applyPromoCode(): void {
    const code = this.promoCodeValue;
    if (!code) return;

    if (this.totalPrice <= 0) {
      this.discountError = 'Avval sanalarni tanlang';
      return;
    }

    this.isValidatingDiscount = true;
    this.discountError = '';

    const validationRequest: DiscountValidationRequest = {
      code: code.toUpperCase(),
      bookingAmount: this.originalPrice,
      propertyType: this.property?.type,
    };

    this.discountService.validateDiscount(validationRequest).subscribe({
      next: (response: DiscountValidationResponse) => {
        this.isValidatingDiscount = false;
        if (response.isValid && response.discount) {
          this.appliedDiscount = response;
          this.discountAmount = response.discountAmount || 0;
          this.finalPrice = response.finalAmount || this.originalPrice;
          this.totalPrice = this.finalPrice;
        } else {
          this.discountError = response.errorMessage || "Noto'g'ri promo kod";
        }
      },
      error: (err: any) => {
        this.isValidatingDiscount = false;
        this.discountError = 'Promo kodni tekshirishda xatolik yuz berdi';
        console.error('Discount validation error:', err);
      },
    });
  }

  removePromoCode(): void {
    this.appliedDiscount = null;
    this.discountError = '';
    this.discountAmount = 0;
    this.calculatePrice();
  }

  getDiscountDisplay(): string {
    if (!this.appliedDiscount?.discount) return '';
    const discount = this.appliedDiscount.discount;
    if (discount.discountType === 'Percentage') {
      return `${discount.discountValue}%`;
    } else {
      return `${discount.discountValue.toLocaleString('uz-UZ')} so'm`;
    }
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const bookingRequest: CreateBookingRequest = this.bookingForm.value;

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = this.property.isInstantBook
          ? 'Bron muvaffaqiyatli tasdiqlandi!'
          : "So'rovingiz yuborildi. Uy egasi tasdiqlaganidan so'ng sizga xabar beramiz.";
        this.bookingForm.reset();
        this.bookingCreated.emit(response);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || "Bron qilishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.";
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private markFormAsTouched(): void {
    Object.values(this.bookingForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}

