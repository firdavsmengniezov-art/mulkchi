import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeRequest } from '../../../core/models/home-request.models';
import { PropertyStatus } from '../../../core/models/property.models';
import { PaymentStatus } from '../../../core/models/payment.models';
import { RequestStatus } from '../../../core/models/home-request.models';
import { AuthService } from '../../../core/services/auth.service';
import { HomeRequestService } from '../../../core/services/home-request.service';
import { LanguageService } from '../../../core/services/language.service';
import { PaymentService } from '../../../core/services/payment.service';
import { PropertyService } from '../../../core/services/property.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="overview-page">
      <div class="overview-header">
        <div>
          <h1>{{ 'overview.title' | translate }}</h1>
          <p class="subtitle">{{ 'overview.subtitle' | translate }}</p>
        </div>
        <a routerLink="/dashboard/my-properties" class="btn-gold">
          {{ 'overview.add_property' | translate }}
        </a>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card card-dark stat-gold">
          <div class="stat-icon-wrap">🏠</div>
          <div class="stat-info">
            <span class="stat-num">{{ activeListings }}</span>
            <span class="stat-label">{{
              'overview.stat_listings' | translate
            }}</span>
          </div>
        </div>
        <div class="stat-card card-dark stat-indigo">
          <div class="stat-icon-wrap">📋</div>
          <div class="stat-info">
            <span class="stat-num">{{ requests.length }}</span>
            <span class="stat-label">{{
              'overview.stat_requests' | translate
            }}</span>
          </div>
        </div>
        <div class="stat-card card-dark stat-green">
          <div class="stat-icon-wrap">💰</div>
          <div class="stat-info">
            <span class="stat-num">{{ monthlyIncome | number }} UZS</span>
            <span class="stat-label">{{
              'overview.stat_income' | translate
            }}</span>
          </div>
        </div>
        <div class="stat-card card-dark stat-amber">
          <div class="stat-icon-wrap">👁️</div>
          <div class="stat-info">
            <span class="stat-num">0</span>
            <span class="stat-label">{{
              'overview.stat_views' | translate
            }}</span>
          </div>
        </div>
      </div>

      <!-- Recent requests -->
      <div class="section">
        <div class="section-header">
          <h2>{{ 'overview.recent' | translate }}</h2>
          <a routerLink="/dashboard/requests" class="see-all">
            {{ 'overview.see_all' | translate }}
          </a>
        </div>

        <div class="table-wrapper">
          <table class="requests-table" *ngIf="requests.length > 0">
            <thead>
              <tr>
                <th>{{ 'overview.col_property' | translate }}</th>
                <th>{{ 'overview.col_checkin' | translate }}</th>
                <th>{{ 'overview.col_checkout' | translate }}</th>
                <th>{{ 'overview.col_nights' | translate }}</th>
                <th>{{ 'overview.col_amount' | translate }}</th>
                <th>{{ 'overview.col_status' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of requests">
                <td>{{ req.propertyId.substring(0, 8) }}...</td>
                <td>
                  {{
                    req.checkInDate
                      ? (req.checkInDate | date: 'dd.MM.yyyy')
                      : '-'
                  }}
                </td>
                <td>
                  {{
                    req.checkOutDate
                      ? (req.checkOutDate | date: 'dd.MM.yyyy')
                      : '-'
                  }}
                </td>
                <td>{{ req.totalNights ?? '-' }}</td>
                <td>{{ req.totalPrice | number }} UZS</td>
                <td>
                  <span
                    class="status-badge"
                    [class]="'status-' + req.status"
                  >
                    {{ getStatusLabel(req.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="empty-state" *ngIf="requests.length === 0">
            {{ 'overview.no_requests' | translate }}
          </p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard-overview.component.scss'],
})
export class DashboardOverviewComponent implements OnInit {
  private readonly homeRequestService = inject(HomeRequestService);
  private readonly propertyService = inject(PropertyService);
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  protected readonly langService = inject(LanguageService);

  requests: HomeRequest[] = [];
  activeListings = 0;
  monthlyIncome = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const userId = this.authService.getUserId();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    this.homeRequestService.getAll(1, 5).subscribe({
      next: (result) => (this.requests = result.items),
      error: () => {},
    });

    this.propertyService.getAll({ pageSize: 100 }).subscribe({
      next: (result) => {
        this.activeListings = result.items.filter(
          (p) => p.hostId === userId && p.status === PropertyStatus.Active,
        ).length;
      },
      error: () => {},
    });

    this.paymentService.getAll().subscribe({
      next: (result) => {
        this.monthlyIncome = result.items
          .filter((p) => {
            const d = new Date(p.createdDate);
            return (
              p.receiverId === userId &&
              d.getMonth() === currentMonth &&
              d.getFullYear() === currentYear
            );
          })
          .reduce((sum, p) => sum + (p.hostReceives ?? p.amount), 0);
      },
      error: () => {},
    });
  }

  getStatusLabel(status: RequestStatus): string {
    const labels: Record<number, string> = {
      [RequestStatus.Pending]: 'Kutilmoqda',
      [RequestStatus.Approved]: 'Tasdiqlangan',
      [RequestStatus.Rejected]: 'Rad etilgan',
      [RequestStatus.Cancelled]: 'Bekor qilingan',
      [RequestStatus.Completed]: 'Yakunlangan',
    };
    return labels[status] ?? String(status);
  }
}
