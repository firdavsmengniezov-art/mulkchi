import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, NotificationType } from '../../../core/models/notification.models';
import { RelativeTimePipe } from '../../../core/pipes/relative-time.pipe';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    RelativeTimePipe
  ],
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  unreadCount = 0;
  loading = true;
  currentTab = 0;
  selectedType: string = 'all';
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.setupSubscriptions();
    this.loadNotifications();
  }

  private setupSubscriptions(): void {
    // Get notifications
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.applyFilters();
      });

    // Get unread count
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.loadNotifications({
      page: this.currentPage,
      pageSize: this.pageSize
    });
  }

  applyFilters(): void {
    this.filteredNotifications = this.notifications.filter(notification => {
      // Filter by tab
      if (this.currentTab === 1 && notification.isRead) return false;
      if (this.currentTab === 1 && !notification.isRead) return true;
      if (this.currentTab === 2) return false;

      // Filter by type
      if (this.selectedType !== 'all' && notification.type !== this.selectedType) return false;

      // Filter by search term
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const title = this.getLocalizedTitle(notification).toLowerCase();
        const body = this.getLocalizedBody(notification).toLowerCase();
        return title.includes(searchLower) || body.includes(searchLower);
      }

      return true;
    });

    this.loading = false;
  }

  onTabChange(index: number): void {
    this.currentTab = index;
    this.applyFilters();
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notification.isRead = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.applyFilters();
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
          this.notifications.forEach(n => n.isRead = true);
          this.unreadCount = 0;
          this.applyFilters();
        },
        error: (err) => {
          this.logger.error('Failed to mark all notifications as read:', err);
        }
      });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          if (!notification.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.applyFilters();
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

  getNotificationTypeLabel(type: NotificationType): string {
    switch (type) {
      case NotificationType.BookingCreated:
        return 'Bron yaratildi';
      case NotificationType.BookingConfirmed:
        return 'Bron tasdiqlandi';
      case NotificationType.BookingCancelled:
        return 'Bron bekor qilindi';
      case NotificationType.NewMessage:
        return 'Yangi xabar';
      case NotificationType.ReviewReceived:
        return 'Sharh qoldirildi';
      case NotificationType.PaymentReceived:
        return 'To\'lov qabul qilindi';
      case NotificationType.PropertyApproved:
        return 'Mulk tasdiqlandi';
      case NotificationType.SystemAlert:
        return 'Tizim xabari';
      default:
        return 'Boshqa';
    }
  }

  getNotificationTypes(): { value: string; label: string }[] {
    return [
      { value: 'all', label: 'Barchasi' },
      { value: NotificationType.BookingCreated, label: this.getNotificationTypeLabel(NotificationType.BookingCreated) },
      { value: NotificationType.BookingConfirmed, label: this.getNotificationTypeLabel(NotificationType.BookingConfirmed) },
      { value: NotificationType.BookingCancelled, label: this.getNotificationTypeLabel(NotificationType.BookingCancelled) },
      { value: NotificationType.NewMessage, label: this.getNotificationTypeLabel(NotificationType.NewMessage) },
      { value: NotificationType.ReviewReceived, label: this.getNotificationTypeLabel(NotificationType.ReviewReceived) },
      { value: NotificationType.PaymentReceived, label: this.getNotificationTypeLabel(NotificationType.PaymentReceived) },
      { value: NotificationType.PropertyApproved, label: this.getNotificationTypeLabel(NotificationType.PropertyApproved) },
      { value: NotificationType.SystemAlert, label: this.getNotificationTypeLabel(NotificationType.SystemAlert) }
    ];
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
