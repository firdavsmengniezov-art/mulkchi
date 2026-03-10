import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  properties: any[] = [];
  bookings: any[] = [];
  loading = true;
  activeTab = 'properties';
  // Stats
  totalProperties = 0;
  totalBookings = 0;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    // Simulate data loading - replace with actual service calls
    setTimeout(() => {
      this.properties = [
        { id: '1', title: 'Test Property 1', city: 'Toshkent', listingType: 'Rent', monthlyRent: 500, viewsCount: 100 },
        { id: '2', title: 'Test Property 2', city: 'Samarqand', listingType: 'Sale', salePrice: 150000, viewsCount: 50 }
      ];
      this.totalProperties = this.properties.length;
      this.bookings = [
        { id: '1', property: { title: 'Test Property 1' }, checkInDate: new Date(), checkOutDate: new Date(), guestsCount: 2, totalPrice: 1000, status: 'Confirmed' }
      ];
      this.totalBookings = this.bookings.length;
      this.loading = false;
    }, 1000);
  }

  deleteProperty(id: string) {
    if (!confirm('Mulkni o\'chirishni tasdiqlaysizmi?')) return;
    this.properties = this.properties.filter(p => p.id !== id);
    this.totalProperties--;
  }

  getListingTypeText(type: string): string {
    const map: any = { 'Rent': 'Ijara', 'Sale': 'Sotiladi', 'DailyRent': 'Kunlik' };
    return map[type] || type;
  }

  getPrice(p: any): string {
    if (p.listingType === 'Rent') return `$${p.monthlyRent}/oy`;
    if (p.listingType === 'Sale') return `$${p.salePrice?.toLocaleString()}`;
    return `$${p.pricePerNight}/kun`;
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Cancelled': 'status-cancelled',
      'Completed': 'status-completed'
    };
    return map[status] || '';
  }

  getStatusText(status: string): string {
    const map: any = {
      'Pending': 'Kutilmoqda',
      'Confirmed': 'Tasdiqlangan',
      'Cancelled': 'Bekor qilingan',
      'Completed': 'Tugallangan'
    };
    return map[status] || status;
  }
}
