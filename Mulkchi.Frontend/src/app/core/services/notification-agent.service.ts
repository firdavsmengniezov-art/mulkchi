import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { Notification, NotificationType } from '../models/notification.models';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';

/**
 * SignalR Announcement Interface
 */
export interface SignalRAnnouncement {
  id: string;
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  bodyUz: string;
  bodyRu?: string;
  bodyEn?: string;
  createdDate: string;
}

/**
 * SignalR Notification Read Event
 */
export interface SignalRNotificationRead {
  id: string;
  readAt: string;
}

/**
 * Signal-based Notification Agent Service
 * Manages real-time notifications using Angular Signals
 */
@Injectable({ providedIn: 'root' })
export class NotificationAgent {
  private hubConnection!: HubConnection;
  private logger = inject(LoggingService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  // ============ STATE SIGNALS ============
  private readonly _notifications = signal<Notification[]>([]);
  private readonly _unreadCount = signal<number>(0);
  private readonly _isConnected = signal<boolean>(false);
  private readonly _isConnecting = signal<boolean>(false);
  private readonly _connectionError = signal<string | null>(null);

  // ============ PUBLIC READABLE SIGNALS ============
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isConnected = this._isConnected.asReadonly();
  readonly isConnecting = this._isConnecting.asReadonly();
  readonly connectionError = this._connectionError.asReadonly();

  // ============ COMPUTED VALUES ============
  readonly allNotifications = computed(() => this._notifications());

  readonly unreadNotifications = computed(() =>
    this._notifications().filter(n => !n.isRead)
  );

  readonly readNotifications = computed(() =>
    this._notifications().filter(n => n.isRead)
  );

  readonly hasUnreadNotifications = computed(() => this._unreadCount() > 0);

  readonly notificationCountByType = computed(() => {
    const counts = new Map<NotificationType, number>();
    this._notifications().forEach(n => {
      const current = counts.get(n.type) || 0;
      counts.set(n.type, current + 1);
    });
    return counts;
  });

  // ============ OBSERVABLE INTEROP ============
  notifications$ = toObservable(this._notifications);
  unreadCount$ = toObservable(this._unreadCount);

  constructor() {
    this.initializeHub();
  }

  private initializeHub(): void {
    const tokenFactory = () => this.authService.getToken() ?? '';
    const hubUrl = environment.hubUrl || environment.apiUrl.replace('/api', '');

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${hubUrl}/hubs/notifications`, { accessTokenFactory: tokenFactory })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.setupHubListeners();
  }

  private setupHubListeners(): void {
    // Receive new notification
    this.hubConnection.on('ReceiveNotification', (notification: Notification) => {
      this.logger.log('SignalR: New notification received', notification);

      this._notifications.update(notifications => {
        // Check if notification already exists
        const exists = notifications.find(n => n.id === notification.id);
        if (exists) {
          return notifications.map(n => n.id === notification.id ? notification : n);
        }
        // Add new notification to the beginning
        return [notification, ...notifications];
      });

      this._unreadCount.update(count => count + 1);
      this.showNotificationToast(notification);
    });

    // Receive system announcement
    this.hubConnection.on('ReceiveAnnouncement', (announcement: SignalRAnnouncement) => {
      this.logger.log('SignalR: New announcement received', announcement);

      const notification: Notification = {
        id: announcement.id,
        userId: 'system',
        titleUz: announcement.titleUz,
        titleRu: announcement.titleRu ?? announcement.titleUz,
        titleEn: announcement.titleEn ?? announcement.titleUz,
        bodyUz: announcement.bodyUz,
        bodyRu: announcement.bodyRu ?? announcement.bodyUz,
        bodyEn: announcement.bodyEn ?? announcement.bodyUz,
        type: NotificationType.SystemAlert,
        isRead: false,
        createdDate: announcement.createdDate,
        updatedDate: announcement.createdDate
      };

      this._notifications.update(notifications => [notification, ...notifications]);
      this._unreadCount.update(count => count + 1);
      this.showNotificationToast(notification);
    });

    // Notification marked as read by another client
    this.hubConnection.on('NotificationRead', (data: SignalRNotificationRead) => {
      this.logger.log('SignalR: Notification marked as read', data);

      this._notifications.update(notifications =>
        notifications.map(n =>
          n.id === data.id ? { ...n, isRead: true, readAt: data.readAt } : n
        )
      );

      this._unreadCount.update(count => Math.max(0, count - 1));
    });

    // All notifications marked as read
    this.hubConnection.on('AllNotificationsRead', () => {
      this.logger.log('SignalR: All notifications marked as read');

      this._notifications.update(notifications =>
        notifications.map(n => ({ ...n, isRead: true }))
      );

      this._unreadCount.set(0);
    });

    // Connection events
    this.hubConnection.onreconnecting(() => {
      this.logger.log('SignalR: Notification hub reconnecting...');
      this._isConnected.set(false);
      this._isConnecting.set(true);
    });

    this.hubConnection.onreconnected(() => {
      this.logger.log('SignalR: Notification hub reconnected');
      this._isConnected.set(true);
      this._isConnecting.set(false);
      this._connectionError.set(null);
    });

    this.hubConnection.onclose((error) => {
      this.logger.error('SignalR: Notification hub closed', error);
      this._isConnected.set(false);
      this._isConnecting.set(false);
      this._connectionError.set(error?.message || 'Connection closed');
    });
  }

  // ============ CONNECTION METHODS ============

  async startConnection(): Promise<void> {
    if (this._isConnecting() || this._isConnected()) {
      this.logger.log('NotificationAgent: Connection already in progress or established');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.logger.log('NotificationAgent: User not authenticated, skipping connection');
      return;
    }

    this._isConnecting.set(true);
    this._connectionError.set(null);

    try {
      await this.hubConnection.start();
      this._isConnected.set(true);
      this._isConnecting.set(false);
      this.logger.log('NotificationAgent: SignalR connection established');
    } catch (err: any) {
      this.logger.error('NotificationAgent: SignalR connection failed', err);
      this._isConnecting.set(false);
      this._connectionError.set(err?.message || 'Failed to connect');
      // Retry after 5 seconds
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  async stopConnection(): Promise<void> {
    try {
      await this.hubConnection?.stop();
      this._isConnected.set(false);
      this._isConnecting.set(false);
      this.logger.log('NotificationAgent: SignalR connection stopped');
    } catch (err) {
      this.logger.error('NotificationAgent: Error stopping SignalR connection', err);
    }
  }

  // ============ NOTIFICATION ACTIONS ============

  async markAsRead(notificationId: string): Promise<void> {
    if (!this._isConnected()) {
      this.logger.warn('NotificationAgent: Cannot mark as read - not connected');
      return;
    }

    try {
      await this.hubConnection.invoke('MarkAsRead', notificationId);

      // Optimistically update local state
      this._notifications.update(notifications =>
        notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );

      this._unreadCount.update(count => Math.max(0, count - 1));
    } catch (err) {
      this.logger.error('NotificationAgent: Failed to mark notification as read', err);
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this._isConnected()) {
      this.logger.warn('NotificationAgent: Cannot mark all as read - not connected');
      return;
    }

    try {
      await this.hubConnection.invoke('MarkAllAsRead');

      // Optimistically update local state
      this._notifications.update(notifications =>
        notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );

      this._unreadCount.set(0);
    } catch (err) {
      this.logger.error('NotificationAgent: Failed to mark all notifications as read', err);
    }
  }

  // ============ STATE MANAGEMENT ============

  setNotifications(notifications: Notification[]): void {
    this._notifications.set(notifications);
    this._unreadCount.set(notifications.filter(n => !n.isRead).length);
  }

  addNotification(notification: Notification): void {
    this._notifications.update(notifications => {
      const exists = notifications.find(n => n.id === notification.id);
      if (exists) return notifications;
      return [notification, ...notifications];
    });

    if (!notification.isRead) {
      this._unreadCount.update(count => count + 1);
    }
  }

  removeNotification(notificationId: string): void {
    this._notifications.update(notifications => {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        this._unreadCount.update(count => Math.max(0, count - 1));
      }
      return notifications.filter(n => n.id !== notificationId);
    });
  }

  clearNotifications(): void {
    this._notifications.set([]);
    this._unreadCount.set(0);
  }

  // ============ PRIVATE HELPERS ============

  private showNotificationToast(notification: Notification): void {
    const title = this.getLocalizedTitle(notification);
    const body = this.getLocalizedBody(notification);

    this.snackBar.open(`${title}: ${body}`, 'Yopish', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'notification-toast'
    });
  }

  private getLocalizedTitle(notification: Notification): string {
    // Default to Uzbek
    return notification.titleUz || 'Yangi bildirishnoma';
  }

  private getLocalizedBody(notification: Notification): string {
    // Default to Uzbek
    return notification.bodyUz || '';
  }
}
