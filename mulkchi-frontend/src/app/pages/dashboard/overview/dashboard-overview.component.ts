import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HomeRequestService } from '../../../core/services/home-request.service';
import { HomeRequest } from '../../../core/models/home-request.models';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="overview-page">
      <div class="overview-header">
        <div>
          <h1>Xush kelibsiz! 👋</h1>
          <p class="subtitle">Bugungi holat va yangiliklar</p>
        </div>
        <a routerLink="/dashboard/my-properties" class="btn-gold">+ Mulk qo'shish</a>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card card-dark">
          <div class="stat-icon">🏠</div>
          <div class="stat-info">
            <span class="stat-num">0</span>
            <span class="stat-label">Aktiv e'lonlar</span>
          </div>
        </div>
        <div class="stat-card card-dark">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <span class="stat-num">{{ requests.length }}</span>
            <span class="stat-label">Yangi so'rovlar</span>
          </div>
        </div>
        <div class="stat-card card-dark">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <span class="stat-num">0 UZS</span>
            <span class="stat-label">Oylik daromad</span>
          </div>
        </div>
        <div class="stat-card card-dark">
          <div class="stat-icon">👁️</div>
          <div class="stat-info">
            <span class="stat-num">0</span>
            <span class="stat-label">Ko'rishlar</span>
          </div>
        </div>
      </div>

      <!-- Recent requests -->
      <div class="section">
        <div class="section-header">
          <h2>So'nggi so'rovlar</h2>
          <a routerLink="/dashboard/requests" class="see-all">Barchasini ko'rish →</a>
        </div>

        <div class="table-wrapper">
          <table class="requests-table" *ngIf="requests.length > 0">
            <thead>
              <tr>
                <th>Mulk</th>
                <th>Kirish</th>
                <th>Chiqish</th>
                <th>Tunlar</th>
                <th>Summa</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of requests">
                <td>{{ req.propertyId.substring(0, 8) }}...</td>
                <td>{{ req.checkInDate | date:'dd.MM.yyyy' }}</td>
                <td>{{ req.checkOutDate | date:'dd.MM.yyyy' }}</td>
                <td>{{ req.totalNights }}</td>
                <td>{{ req.totalPrice | number }} UZS</td>
                <td><span class="status-badge" [class]="'status-' + req.status.toLowerCase()">{{ req.status }}</span></td>
              </tr>
            </tbody>
          </table>
          <p class="empty-state" *ngIf="requests.length === 0">So'rovlar mavjud emas</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard-overview.component.scss']
})
export class DashboardOverviewComponent implements OnInit {
  private readonly homeRequestService = inject(HomeRequestService);
  requests: HomeRequest[] = [];

  ngOnInit(): void {
    this.homeRequestService.getAll(1, 5).subscribe({
      next: (result) => this.requests = result.items,
      error: () => {}
    });
  }
}
