import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { CreateBookingRequest, BookingStatus } from '../../../core/models/booking.model';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="booking-form" *ngIf="property">
      <h3>Bron qilish</h3>
      
      <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
        <!-- Check-in Date -->
        <div class="form-group">
          <label for="checkInDate">Kirish sanasi</label>
          <input 
            type="date" 
            id="checkInDate" 
            formControlName="checkInDate"
            [min]="minDate"
            class="form-control">
          <div class="error" *ngIf="bookingForm.get('checkInDate')?.invalid && bookingForm.get('checkInDate')?.touched">
            Kirish sanasini tanlang
          </div>
        </div>

        <!-- Check-out Date -->
        <div class="form-group">
          <label for="checkOutDate">Chiqish sanasi</label>
          <input 
            type="date" 
            id="checkOutDate" 
            formControlName="checkOutDate"
            [min]="bookingForm.get('checkInDate')?.value || minDate"
            class="form-control">
          <div class="error" *ngIf="bookingForm.get('checkOutDate')?.invalid && bookingForm.get('checkOutDate')?.touched">
            Chiqish sanasini tanlang
          </div>
        </div>

        <!-- Number of Guests -->
        <div class="form-group">
          <label for="guestsCount">Mehmonlar soni</label>
          <input 
            type="number" 
            id="guestsCount" 
            formControlName="guestsCount"
            [min]="1"
            [max]="property?.maxGuests || 10"
            class="form-control">
          <div class="error" *ngIf="bookingForm.get('guestsCount')?.invalid && bookingForm.get('guestsCount')?.touched">
            Mehmonlar sonini kiriting (1-{{property?.maxGuests || 10}})
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label for="notes">Izoh (ixtiyoriy)</label>
          <textarea 
            id="notes" 
            formControlName="notes"
            rows="3"
            class="form-control"
            placeholder="Qo'shimcha ma'lumot..."></textarea>
        </div>

        <!-- Price Calculation -->
        <div class="price-summary" *ngIf="totalPrice > 0">
          <div class="price-row">
            <span>Narx bir kechaga:</span>
            <span>{{property?.pricePerNight | number}} so'm</span>
          </div>
          <div class="price-row">
            <span>Kechalar soni:</span>
            <span>{{numberOfNights}}</span>
          </div>
          <div class="price-row total">
            <span>Jami narx:</span>
            <span>{{totalPrice | number}} so'm</span>
          </div>
        </div>

        <!-- Instant Book Badge -->
        <div class="instant-book-badge" *ngIf="property?.isInstantBook">
          ⚡ Darhol bron
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="bookingForm.invalid || isLoading">
            {{isLoading ? 'Yuborilmoqda...' : (property?.isInstantBook ? 'Darhol bron' : 'So\'rov yuborish')}}
          </button>
          
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="onCancel()">
            Bekor qilish
          </button>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div class="alert alert-success" *ngIf="successMessage">
        {{successMessage}}
      </div>
      
      <div class="alert alert-error" *ngIf="errorMessage">
        {{errorMessage}}
      </div>
    </div>
  `,
  styleUrls: ['./booking-form.component.scss']
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

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      propertyId: [this.property?.id || '', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      guestsCount: [1, [Validators.required, Validators.min(1), Validators.max(this.property?.maxGuests || 10)]],
      notes: ['']
    });

    // Watch for date changes to calculate price
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(() => this.calculatePrice());
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => this.calculatePrice());
  }

  calculatePrice(): void {
    const checkInDate = this.bookingForm.get('checkInDate')?.value;
    const checkOutDate = this.bookingForm.get('checkOutDate')?.value;
    const pricePerNight = this.property?.pricePerNight || 0;

    if (checkInDate && checkOutDate && pricePerNight > 0) {
      this.totalPrice = this.bookingService.calculateTotalPrice(checkInDate, checkOutDate, pricePerNight);
      
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      this.numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      this.totalPrice = 0;
      this.numberOfNights = 0;
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
      next: (response) => {
        this.isLoading = false;
        this.successMessage = this.property?.isInstantBook 
          ? 'Bron muvaffaqiyatli tasdiqlandi!' 
          : 'So\'rovingiz yuborildi. Uy egasi tasdiqlaganidan so\'ng sizga xabar beramiz.';
        
        this.bookingForm.reset();
        this.bookingCreated.emit(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Bron qilishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.';
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private markFormAsTouched(): void {
    Object.values(this.bookingForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
