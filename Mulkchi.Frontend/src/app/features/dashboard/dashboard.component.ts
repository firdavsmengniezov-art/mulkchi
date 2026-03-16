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
        { id: '1', title: 'Toshkent shahrida 3 xonali kvartira', listingType: 'Rent', monthlyRent: 500, viewsCount: 45 },
        { id: '2', title: 'Samarqand viloyatida 2 xonali uy', listingType: 'Sale', salePrice: 120000, viewsCount: 23 }
      ];
      
      this.bookings = [
        { id: '1', property: { title: 'Toshkent shahrida 3 xonali kvartira' }, checkInDate: '2024-01-15', checkOutDate: '2024-01-20', guestsCount: 2, totalPrice: 500, status: 'Confirmed' },
        { id: '2', property: { title: 'Samarqand viloyatida 2 xonali uy' }, checkInDate: '2024-02-10', checkOutDate: '2024-02-15', guestsCount: 3, totalPrice: 800, status: 'Pending' }
      ];
      
      this.totalProperties = this.properties.length;
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

  getPrice(p: any): string {
    if (p.monthlyRent) return `$${p.monthlyRent}/oy`;
    if (p.salePrice) return `$${p.salePrice.toLocaleString()}`;
    if (p.pricePerNight) return `$${p.pricePerNight}/kun`;
    return 'Narx mavjud emas';
  }
}
