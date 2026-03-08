import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Notification, NotificationType } from '../../../core/models/notification.models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <h1>🔔 Bildirishnomalar</h1>
      </div>

      <div class="notifications-list" *ngIf="notifications.length > 0; else emptyTpl">
        <div
          class="notification-card"
          *ngFor="let n of notifications"
          [class.unread]="!n.isRead"
        >
          <div class="notif-icon">{{ getIcon(n.type) }}</div>
          <div class="notif-body">
            <div class="notif-header">
              <span class="notif-title">{{ n.titleUz }}</span>
              <span class="unread-dot" *ngIf="!n.isRead"></span>
            </div>
            <p class="notif-text">{{ n.bodyUz }}</p>
            <span class="notif-date">{{ n.createdDate | date: 'dd.MM.yyyy HH:mm' }}</span>
          </div>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="empty-state">
          <p>Bildirishnomalar yo'q</p>
        </div>
      </ng-template>

      <div class="pagination" *ngIf="totalCount > pageSize">
        <button
          class="page-btn"
          [disabled]="page <= 1"
          (click)="changePage(page - 1)"
        >‹</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button
          class="page-btn"
          [disabled]="page >= totalPages"
          (click)="changePage(page + 1)"
        >›</button>
      </div>
    </div>
  `,
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);

  notifications: Notification[] = [];
  page = 1;
  pageSize = 20;
  totalCount = 0;

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.notificationService.getAll(this.page, this.pageSize).subscribe({
      next: (result) => {
        this.notifications = result.items;
        this.totalCount = result.totalCount;
      },
      error: () => {},
    });
  }

  changePage(p: number): void {
    this.page = p;
    this.load();
  }

  getIcon(type: NotificationType): string {
    const icons: Record<number, string> = {
      [NotificationType.BookingRequest]: '📋',
      [NotificationType.BookingApproved]: '✅',
      [NotificationType.BookingRejected]: '❌',
      [NotificationType.PaymentReceived]: '💰',
      [NotificationType.NewMessage]: '💬',
      [NotificationType.ReviewReceived]: '⭐',
      [NotificationType.SystemAlert]: '⚠️',
    };
    return icons[type] ?? '🔔';
  }
}
