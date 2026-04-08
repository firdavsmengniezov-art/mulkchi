import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { Notification, NotificationType } from '../../../../core/models/notification.models';
import { RelativeTimePipe } from '../../../../core/pipes/relative-time.pipe';
import { LoggingService } from '../../../../core/services/logging.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RelativeTimePipe
  ],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    // Get notifications
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.slice(0, 5); // Show only 5 recent notifications
      });

    // Get unread count
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
        this.loading = false;
      });

    // Load initial notifications
    this.notificationService.loadNotifications({ page: 1, pageSize: 5 });
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Update local state
            notification.isRead = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          },
          error: (err) => {
            this.logger.error('Failed to mark notification as read:', err);
          }
        });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local state
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
        },
        error: (err) => {
          this.logger.error('Failed to mark all notifications as read:', err);
        }
      });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local state
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          if (!notification.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        },
        error: (err) => {
          this.logger.error('Failed to delete notification:', err);
        }
      });
  }

  onNotificationClick(notification: Notification): void {
    this.markAsRead(notification);
    
    // Navigate to related entity if actionUrl exists
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  getNotificationIcon(type: NotificationType): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationColor(type: NotificationType): string {
    return this.notificationService.getNotificationColor(type);
  }

  getLocalizedTitle(notification: Notification): string {
    const lang = localStorage.getItem('language') || 'uz';
    switch (lang) {
      case 'ru': return notification.titleRu || notification.titleUz;
      case 'en': return notification.titleEn || notification.titleUz;
      default: return notification.titleUz;
    }
  }

  getLocalizedBody(notification: Notification): string {
    const lang = localStorage.getItem('language') || 'uz';
    switch (lang) {
      case 'ru': return notification.bodyRu || notification.bodyUz;
      case 'en': return notification.bodyEn || notification.bodyUz;
      default: return notification.bodyUz;
    }
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
