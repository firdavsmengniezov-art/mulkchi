import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { HomeRequest, RequestStatus, RequestType } from '../../../core/models/home-request.models';
import { AuthService } from '../../../core/services/auth.service';
import { HomeRequestService } from '../../../core/services/home-request.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="requests-page">
      <h1>{{ 'requests.title' | translate }}</h1>

      <div class="table-wrapper">
        <table class="data-table" *ngIf="requests.length > 0">
          <thead>
            <tr>
              <th>{{ 'requests.col_property' | translate }}</th>
              <th>{{ 'requests.col_type' | translate }}</th>
              <th>{{ 'requests.col_checkin' | translate }}</th>
              <th>{{ 'requests.col_checkout' | translate }}</th>
              <th>{{ 'requests.col_nights' | translate }}</th>
              <th>{{ 'requests.col_amount' | translate }}</th>
              <th>{{ 'requests.col_status' | translate }}</th>
              <th>{{ 'requests.col_actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let req of requests">
              <td>{{ req.propertyId.substring(0, 8) }}...</td>
              <td>
                <span class="type-badge">{{ getTypeLabel(req.type) }}</span>
              </td>
              <td>
                {{
                  req.checkInDate ? (req.checkInDate | date: 'dd.MM.yyyy') : '-'
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
                  [ngClass]="'status-' + req.status"
                >
                  {{ getStatusLabel(req.status) }}
                </span>
              </td>
              <td>
                <ng-container *ngIf="req.status === RequestStatus.Pending && isHost">
                  <button class="btn-approve" (click)="approveRequest(req)">
                    {{ 'requests.approve' | translate }}
                  </button>
                  <button class="btn-reject" (click)="rejectRequest(req)">
                    {{ 'requests.reject' | translate }}
                  </button>
                </ng-container>
                <small
                  *ngIf="req.status === RequestStatus.Rejected && req.rejectionReason"
                  class="reason-text"
                >
                  📋 {{ req.rejectionReason }}
                </small>
                <small
                  *ngIf="req.status === RequestStatus.Cancelled && req.cancellationReason"
                  class="reason-text"
                >
                  📋 {{ req.cancellationReason }}
                </small>
              </td>
            </tr>
          </tbody>
        </table>
        <p class="empty-state" *ngIf="requests.length === 0">
          {{ 'requests.empty' | translate }}
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./requests.component.scss'],
})
export class RequestsComponent implements OnInit {
  private readonly homeRequestService = inject(HomeRequestService);
  private readonly authService = inject(AuthService);
  private readonly langService = inject(LanguageService);
  readonly RequestStatus = RequestStatus;
  requests: HomeRequest[] = [];
  isHost =
    this.authService.getRole() === String(1) ||
    this.authService.getRole() === 'Host' ||
    this.authService.getRole() === 'Admin';

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.homeRequestService.getAll().subscribe({
      next: (result) => (this.requests = result.items),
      error: () => {},
    });
  }

  approveRequest(req: HomeRequest): void {
    this.homeRequestService.update({ ...req, status: RequestStatus.Approved }).subscribe({
      next: () => this.loadRequests(),
      error: () => {},
    });
  }

  rejectRequest(req: HomeRequest): void {
    const reason = prompt(this.langService.t('requests.reject_prompt')) ?? '';
    this.homeRequestService
      .update({ ...req, status: RequestStatus.Rejected, rejectionReason: reason })
      .subscribe({
        next: () => this.loadRequests(),
        error: () => {},
      });
  }

  getTypeLabel(type: RequestType): string {
    const labels: Record<number, string> = {
      [RequestType.Booking]: 'Bron',
      [RequestType.Inquiry]: "So'rov",
      [RequestType.ShortTermRent]: 'Qisqa muddatli',
    };
    return labels[type] ?? String(type);
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
