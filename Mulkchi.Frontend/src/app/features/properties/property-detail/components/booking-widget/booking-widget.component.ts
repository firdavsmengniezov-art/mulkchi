import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-widget.component.html',
  styleUrls: ['./booking-widget.component.scss'],
})
export class BookingWidgetComponent {
  @Input() property: any;
  @Input() reviewSummary: any;
  @Input() blockedDates: string[] = [];
  @Output() bookingCreated = new EventEmitter<any>();

  checkInDate: string = '';
  checkOutDate: string = '';
  guestsCount: number = 1;

  get priceNode(): number {
    return (
      this.property?.monthlyRent ?? this.property?.salePrice ?? this.property?.pricePerNight ?? 0
    );
  }

  get isRentOrNight(): boolean {
    return !!this.property?.monthlyRent || !!this.property?.pricePerNight;
  }

  get priceSuffix(): string {
    if (this.property?.pricePerNight) return '/ kecha';
    if (this.property?.monthlyRent) return '/ oy';
    return '';
  }

  get totalNights(): number {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    const d1 = new Date(this.checkInDate);
    const d2 = new Date(this.checkOutDate);
    const diff = d2.getTime() - d1.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  }

  get calculatedPrice(): number {
    return this.totalNights * this.priceNode;
  }

  get serviceFee(): number {
    return this.calculatedPrice * 0.03;
  }

  get finalTotal(): number {
    return this.calculatedPrice + this.serviceFee;
  }

  canBook(): boolean {
    return (
      this.totalNights > 0 &&
      this.guestsCount > 0 &&
      this.guestsCount <= (this.property?.maxGuests || 10)
    );
  }

  isDateBlocked(dateStr: string): boolean {
    return this.blockedDates.includes(dateStr);
  }

  onBookClicked() {
    if (!this.canBook()) return;
    this.bookingCreated.emit({
      propertyId: this.property.id,
      checkInDate: new Date(this.checkInDate).toISOString(),
      checkOutDate: new Date(this.checkOutDate).toISOString(),
      guestsCount: this.guestsCount,
      totalPrice: this.finalTotal,
    });
  }

  todayStr(): string { return new Date().toISOString().split('T')[0]; }
  guestsArray(max: number): number[] { return Array.from({length: max}, (_, i) => i + 1); }
}


