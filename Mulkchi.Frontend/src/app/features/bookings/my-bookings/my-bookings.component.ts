import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { PagedResult } from '../../../core/models/paged-result.model';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-bookings">
      <div class="page-header">
        <h1>Mening bronlarim</h1>
        <p>Barcha bronlaringizni bu yerda ko'rishingiz mumkin</p>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Bronlar yuklanmoqda...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && bookings.length === 0">
        <div class="empty-icon">📅</div>
        <h3>Hali bronlaringiz yo'q</h3>
        <p>Boshlanish uchun mulklarni ko'ring va bron qiling</p>
        <a routerLink="/" class="btn btn-primary">Mulkklarni ko'rish</a>
      </div>

      <!-- Bookings List -->
      <div class="bookings-list" *ngIf="!isLoading && bookings.length > 0">
        <div class="booking-card" *ngFor="let booking of bookings">
          <div class="booking-header">
            <div class="booking-info">
              <h4>{{booking.property?.title || 'Noma\'lum mulk'}}</h4>
              <p class="booking-dates">
                📅 {{formatDate(booking.checkInDate)}} - {{formatDate(booking.checkOutDate)}}
              </p>
              <p class="booking-guests">
                👥 {{booking.guestsCount}} mehmon
              </p>
            </div>
            <div class="booking-status">
              <span 
                class="status-badge" 
                [style.background-color]="getStatusColor(booking.status)">
                {{getStatusText(booking.status)}}
              </span>
            </div>
          </div>

          <div class="booking-details">
            <div class="detail-row">
              <span>Manzil:</span>
              <span>{{booking.property?.address}}, {{booking.property?.city}}</span>
            </div>
            <div class="detail-row">
              <span>Jami narx:</span>
              <span class="price">{{booking.totalPrice | number}} so'm</span>
            </div>
            <div class="detail-row" *ngIf="booking.notes">
              <span>Izoh:</span>
              <span>{{booking.notes}}</span>
            </div>
          </div>

          <div class="booking-actions">
            <button 
              class="btn btn-sm btn-outline"
              (click)="viewBooking(booking.id)">
              Batafsil
            </button>
            
            <button 
              class="btn btn-sm btn-danger"
              *ngIf="canCancelBooking(booking.status)"
              (click)="cancelBooking(booking.id)">
              Bekor qilish
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="!isLoading && bookings.length > 0">
        <button 
          class="btn btn-outline" 
          [disabled]="currentPage === 1"
          (click)="previousPage()">
          ← Oldingi
        </button>
        
        <span class="page-info">
          Sahifa {{currentPage}} / {{totalPages}}
        </span>
        
        <button 
          class="btn btn-outline" 
          [disabled]="currentPage === totalPages"
          (click)="nextPage()">
          Keyingi →
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  constructor(private bookingService: BookingService,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingService.getMyBookings(this.currentPage, this.pageSize).subscribe({
      next: (response: PagedResult<Booking>) => {
        this.bookings = response.items || [];
        this.totalCount = response.totalCount || 0;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBookings();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBookings();
    }
  }

  viewBooking(bookingId: string): void {
    // Navigate to booking details
    // this.router.navigate(['/bookings', bookingId]);
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Bu bronni bekor qilishni xohlaysizmi?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          // Remove from local list or reload
          this.loadBookings();
        },
        error: (error) => {
          this.logger.error('Error cancelling booking:', error);
          alert('Bronni bekor qilishda xatolik yuz berdi.');
        }
      });
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusText(status: BookingStatus): string {
    return this.bookingService.getBookingStatusText(status);
  }

  getStatusColor(status: BookingStatus): string {
    return this.bookingService.getBookingStatusColor(status);
  }

  canCancelBooking(status: BookingStatus): boolean {
    return this.bookingService.canCancelBooking(status);
  }
}
