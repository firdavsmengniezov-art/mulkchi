import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { Booking, BookingStatus } from '../../../core/models/booking.model';
import { PagedResult } from '../../../core/models/paged-result.model';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-host-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="host-bookings">
      <div class="page-header">
        <h1>Uy egasi bronlari</h1>
        <p>Mulklaringiz uchun kelgan bron so'rovlari</p>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Bronlar yuklanmoqda...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && bookings.length === 0">
        <div class="empty-icon">🏠</div>
        <h3>Hali bron so'rovlari yo'q</h3>
        <p>Mulklaringizga bron so'rovlari kelganda bu yerda ko'rsatiladi</p>
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
              <p class="booking-price">
                💰 {{booking.totalPrice | number}} so'm
              </p>
            </div>
            <div class="booking-status">
              <span 
                class="status-badge" 
                [style.background-color]="getStatusColor(booking.status)">
                {{getStatusText(booking.status)}}
              </span>
              <span class="instant-book-badge" *ngIf="booking.isInstantBook">
                ⚡
              </span>
            </div>
          </div>

          <div class="booking-details">
            <div class="detail-row">
              <span>Mehmon ID:</span>
              <span>{{booking.guestId}}</span>
            </div>
            <div class="detail-row" *ngIf="booking.notes">
              <span>Izoh:</span>
              <span>{{booking.notes}}</span>
            </div>
            <div class="detail-row">
              <span>Bron vaqti:</span>
              <span>{{formatDateTime(booking.createdDate)}}</span>
            </div>
          </div>

          <div class="booking-actions">
            <button 
              class="btn btn-sm btn-outline"
              (click)="viewBooking(booking.id)">
              Batafsil
            </button>
            
            <button 
              class="btn btn-sm btn-success"
              *ngIf="canConfirmBooking(booking.status)"
              (click)="confirmBooking(booking.id)">
              ✅ Tasdiqlash
            </button>
            
            <button 
              class="btn btn-sm btn-warning"
              *ngIf="canCancelBooking(booking.status)"
              (click)="cancelBooking(booking.id)">
              ❌ Rad etish
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
  styleUrls: ['./host-bookings.component.scss']
})
export class HostBookingsComponent implements OnInit {
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
    this.bookingService.getHostBookings(this.currentPage, this.pageSize).subscribe({
      next: (response: PagedResult<Booking>) => {
        this.bookings = response.items || [];
        this.totalCount = response.totalCount || 0;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading host bookings:', error);
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
    // this.router.navigate(['/host/bookings', bookingId]);
  }

  confirmBooking(bookingId: string): void {
    if (confirm('Bu bronni tasdiqlaysizmi?')) {
      this.bookingService.confirmBooking(bookingId).subscribe({
        next: () => {
          // Reload bookings
          this.loadBookings();
        },
        error: (error) => {
          this.logger.error('Error confirming booking:', error);
          alert('Bronni tasdiqlashda xatolik yuz berdi.');
        }
      });
    }
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Bu bronni rad etishni xohlaysizmi?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          // Reload bookings
          this.loadBookings();
        },
        error: (error) => {
          this.logger.error('Error cancelling booking:', error);
          alert('Bronni rad etishda xatolik yuz berdi.');
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

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status: BookingStatus): string {
    return this.bookingService.getBookingStatusText(status);
  }

  getStatusColor(status: BookingStatus): string {
    return this.bookingService.getBookingStatusColor(status);
  }

  canConfirmBooking(status: BookingStatus): boolean {
    return this.bookingService.canConfirmBooking(status);
  }

  canCancelBooking(status: BookingStatus): boolean {
    return this.bookingService.canCancelBooking(status);
  }
}
