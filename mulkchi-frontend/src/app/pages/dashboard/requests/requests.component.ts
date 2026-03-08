import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRequestService } from '../../../core/services/home-request.service';
import { HomeRequest } from '../../../core/models/home-request.models';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="requests-page">
      <h1>So'rovlar</h1>

      <div class="table-wrapper">
        <table class="data-table" *ngIf="requests.length > 0">
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
              <td>
                <span class="status-badge" [ngClass]="'status-' + req.status.toLowerCase()">
                  {{ getStatusLabel(req.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="empty-state" *ngIf="requests.length === 0">So'rovlar mavjud emas</p>
      </div>
    </div>
  `,
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  private readonly homeRequestService = inject(HomeRequestService);
  requests: HomeRequest[] = [];

  ngOnInit(): void {
    this.homeRequestService.getAll().subscribe({
      next: (result) => this.requests = result.items,
      error: () => {}
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'Kutilmoqda',
      Approved: 'Tasdiqlangan',
      Rejected: 'Rad etilgan',
      Cancelled: 'Bekor qilingan',
      Completed: 'Yakunlangan'
    };
    return labels[status] ?? status;
  }
}
