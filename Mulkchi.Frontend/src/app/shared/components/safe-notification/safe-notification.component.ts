import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationPayload } from '../../../core/services/signalr.service';
import { SafeAvatarComponent } from '../safe-avatar/safe-avatar.component';

/**
 * Safe Notification Component
 * SignalR notification ma'lumotlari xavfsizlik bilan ishlatiladi
 * null/undefined tekshiruvlari bilan
 * 
 * Usage:
 * ```html
 * <app-safe-notification 
 *   [notification]="notificationData"
 *   (markAsRead)="onRead($event)">
 * </app-safe-notification>
 * ```
 */
@Component({
  selector: 'app-safe-notification',
  standalone: true,
  imports: [CommonModule, SafeAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (safeNotification; as n) {
      <div 
        class="notification-item p-4 rounded-lg border transition-all duration-200"
        [class.bg-white]="!n.isRead"
        [class.bg-gray-50]="n.isRead"
        [class.border-l-4]="!n.isRead"
        [class.border-indigo-500]="!n.isRead"
        [class.border-gray-200]="n.isRead"
        (click)="handleClick()"
      >
        <div class="flex items-start gap-3">
          <!-- Safe Avatar -->
          <app-safe-avatar 
            [src]="n.avatarUrl"
            [name]="n.senderName"
            size="sm">
          </app-safe-avatar>
          
          <div class="flex-1 min-w-0">
            <!-- Safe Title -->
            @if (n.title; as title) {
              <h4 class="font-semibold text-gray-900 truncate">
                {{ title }}
              </h4>
            }
            
            <!-- Safe Body with null check -->
            @if (hasBody(); as body) {
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                {{ body }}
              </p>
            } @else {
              <p class="text-sm text-gray-400 mt-1 italic">
                Xabar mavjud emas
              </p>
            }
            
            <!-- Safe Date -->
            @if (n.createdDate) {
              <span class="text-xs text-gray-400 mt-2 block">
                {{ formatDate(n.createdDate) }}
              </span>
            }
          </div>
          
          <!-- Unread indicator -->
          @if (!n.isRead) {
            <span class="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2"></span>
          }
        </div>
      </div>
    } @else {
      <!-- Empty/Invalid state -->
      <div class="notification-placeholder p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .notification-item {
      cursor: pointer;
    }
    .notification-item:hover {
      background-color: rgb(249, 250, 251);
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class SafeNotificationComponent {
  @Input() notification: NotificationPayload | null | undefined;
  @Input() isRead = false;
  @Output() markAsRead = new EventEmitter<string>();
  @Output() click = new EventEmitter<void>();

  // Safe getter with null checks
  get safeNotification(): SafeNotification | null {
    if (!this.notification || typeof this.notification !== 'object') {
      return null;
    }

    const n = this.notification;
    
    return {
      id: n.id || 'unknown',
      type: n.type || 'info',
      // Safe message/body access with nullish coalescing
      message: n.message ?? n.body ?? 'No message',
      body: n.body ?? n.message ?? null,
      title: n.title ?? null,
      createdDate: n.createdDate || new Date().toISOString(),
      isRead: this.isRead,
      senderName: this.extractSenderName(n),
      avatarUrl: this.extractAvatarUrl(n)
    };
  }

  hasBody(): string | null {
    const n = this.safeNotification;
    if (!n) return null;
    
    // Check for body or message
    const content = n.body || n.message;
    return content && content.trim() !== '' ? content : null;
  }

  private extractSenderName(n: NotificationPayload): string {
    // Try to extract sender name from notification data
    if ((n as any).senderName) {
      return (n as any).senderName;
    }
    if ((n as any).userName) {
      return (n as any).userName;
    }
    if ((n as any).from) {
      return (n as any).from;
    }
    return 'System';
  }

  private extractAvatarUrl(n: NotificationPayload): string | null {
    if ((n as any).avatarUrl) {
      return (n as any).avatarUrl;
    }
    if ((n as any).senderAvatar) {
      return (n as any).senderAvatar;
    }
    return null;
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Hozirgina';
      if (diffMins < 60) return `${diffMins} daqiqa oldin`;
      if (diffHours < 24) return `${diffHours} soat oldin`;
      if (diffDays < 7) return `${diffDays} kun oldin`;
      
      return date.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return dateString;
    }
  }

  handleClick(): void {
    const n = this.safeNotification;
    if (n && !this.isRead) {
      this.markAsRead.emit(n.id);
    }
    this.click.emit();
  }
}

// Internal interface for safe notification data
interface SafeNotification {
  id: string;
  type: string;
  message: string;
  body: string | null;
  title: string | null;
  createdDate: string;
  isRead: boolean;
  senderName: string;
  avatarUrl: string | null;
}
