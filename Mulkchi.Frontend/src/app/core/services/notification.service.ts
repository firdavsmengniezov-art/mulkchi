import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';
import { Notification, NotificationType, PagedResult } from '../models/notification.models';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private hubConnection: HubConnection;
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private loggingService: LoggingService
  ) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/notificationhub`, {
        accessTokenFactory: () => sessionStorage.getItem('access_token') || ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.setupHubListeners();
  }

  private setupHubListeners(): void {
    this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
      const current = this.notifications$.value;
      this.notifications$.next([notification, ...current]);
      this.unreadCount$.next(this.unreadCount$.value + 1);
      this.showSnackBarNotification(notification);
    });

    this.hubConnection.on('ReceiveAnnouncement', (announcement: any) => {
      const notification: Notification = {
        ...announcement,
        titleUz: announcement.titleUz,
        titleRu: announcement.titleRu,
        titleEn: announcement.titleEn,
        bodyUz: announcement.bodyUz,
        bodyRu: announcement.bodyRu,
        bodyEn: announcement.bodyEn,
        type: NotificationType.SystemAlert,
        isRead: false,
        createdDate: announcement.createdDate
      };
      
      const current = this.notifications$.value;
      this.notifications$.next([notification, ...current]);
      this.unreadCount$.next(this.unreadCount$.value + 1);
      this.showSnackBarNotification(notification);
    });

    this.hubConnection.on('NotificationRead', (data: any) => {
      const current = this.notifications$.value;
      const updated = current.map(n => 
        n.id === data.id ? { ...n, isRead: true, readAt: data.readAt } : n
      );
      this.notifications$.next(updated);
      
      // Update unread count
      const unreadCount = updated.filter(n => !n.isRead).length;
      this.unreadCount$.next(unreadCount);
    });

    this.hubConnection.onreconnecting(() => {
      this.loggingService.log('Notification hub reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.loggingService.log('Notification hub reconnected');
    });

    this.hubConnection.onclose(() => {
      this.loggingService.log('Notification hub connection closed');
    });
  }

  async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      this.loggingService.log('Notification hub connection established');
    } catch (err) {
      this.loggingService.error('Notification hub connection failed:', err);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  getAll(pagination?: { page: number; pageSize: number }): Observable<PagedResult<Notification>> {
    const params = pagination ? `?page=${pagination.page}&pageSize=${pagination.pageSize}` : '';
    return this.http.get<PagedResult<Notification>>(`${environment.apiUrl}/notifications${params}`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/notifications/read-all`, {});
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/notifications/${id}`);
  }

  getNotifications(): Observable<Notification[]> { 
    return this.notifications$.asObservable(); 
  }

  getUnreadCount(): Observable<number> { 
    return this.unreadCount$.asObservable(); 
  }

  loadNotifications(pagination?: { page: number; pageSize: number }): void {
    this.getAll(pagination)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: PagedResult<Notification>) => {
          this.notifications$.next(result.items);
          this.unreadCount$.next(result.items.filter((n: Notification) => !n.isRead).length);
        },
        error: (err) => {
          this.loggingService.error('Failed to load notifications:', err);
        }
      });
  }

  private showSnackBarNotification(notification: Notification): void {
    const title = this.getLocalizedTitle(notification);
    const message = this.getLocalizedBody(notification);
    
    const snackBarRef = this.snackBar.open(title, 'Ko\'rish', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });

    snackBarRef.onAction().pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.router.navigate(['/notifications']);
    });
  }

  private getLocalizedTitle(notification: Notification): string {
    // Get current language from localStorage or default to 'uz'
    const lang = localStorage.getItem('language') || 'uz';
    switch (lang) {
      case 'ru': return notification.titleRu || notification.titleUz;
      case 'en': return notification.titleEn || notification.titleUz;
      default: return notification.titleUz;
    }
  }

  private getLocalizedBody(notification: Notification): string {
    const lang = localStorage.getItem('language') || 'uz';
    switch (lang) {
      case 'ru': return notification.bodyRu || notification.bodyUz;
      case 'en': return notification.bodyEn || notification.bodyUz;
      default: return notification.bodyUz;
    }
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.BookingCreated:
      case NotificationType.BookingConfirmed:
      case NotificationType.BookingCancelled:
        return 'home';
      case NotificationType.NewMessage:
        return 'chat';
      case NotificationType.ReviewReceived:
        return 'star';
      case NotificationType.PaymentReceived:
        return 'payment';
      case NotificationType.PropertyApproved:
        return 'verified';
      case NotificationType.SystemAlert:
        return 'warning';
      default:
        return 'info';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.BookingCreated:
      case NotificationType.BookingConfirmed:
        return 'primary';
      case NotificationType.BookingCancelled:
      case NotificationType.SystemAlert:
        return 'warn';
      case NotificationType.PaymentReceived:
        return 'accent';
      case NotificationType.ReviewReceived:
        return 'primary';
      default:
        return '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
