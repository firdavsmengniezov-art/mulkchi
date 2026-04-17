import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeAvatarComponent } from '../safe-avatar/safe-avatar.component';
import { Message } from '../../../core/models/message.model';

/**
 * Safe Chat Message Component
 * SignalR chat xabarlarini xavfsizlik bilan ishlatadi
 * null/undefined va bo'sh ma'lumotlar uchun tekshiruvlar
 * 
 * Usage:
 * ```html
 * <app-safe-chat-message 
 *   [message]="messageData"
 *   [isOwn]="message.senderId === currentUserId"
 *   (resend)="onResend($event)">
 * </app-safe-chat-message>
 * ```
 */
@Component({
  selector: 'app-safe-chat-message',
  standalone: true,
  imports: [CommonModule, SafeAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (safeMessage; as msg) {
      <div 
        class="message-wrapper flex gap-3 mb-4"
        [class.flex-row-reverse]="msg.isOwn"
        [class.opacity-60]="msg.isPending"
      >
        <!-- Safe Avatar -->
        <app-safe-avatar 
          [src]="msg.senderAvatar"
          [name]="msg.senderName"
          size="md">
        </app-safe-avatar>
        
        <div class="flex flex-col max-w-[75%]" [class.items-end]="msg.isOwn">
          <!-- Sender name -->
          <span class="text-xs text-gray-500 mb-1 px-1">
            {{ msg.senderName }}
          </span>
          
          <!-- Message bubble -->
          <div 
            class="message-bubble px-4 py-2 rounded-2xl"
            [class.bg-indigo-500]="msg.isOwn"
            [class.text-white]="msg.isOwn"
            [class.bg-gray-100]="!msg.isOwn"
            [class.text-gray-900]="!msg.isOwn"
            [class.rounded-br-none]="msg.isOwn"
            [class.rounded-bl-none]="!msg.isOwn"
          >
            <!-- Safe content with null check -->
            @if (hasContent(); as content) {
              <p class="text-sm whitespace-pre-wrap">{{ content }}</p>
            } @else {
              <p class="text-sm italic opacity-50">(Bo'sh xabar)</p>
            }
            
            <!-- Attachments (safe access) -->
            @if (hasAttachments()) {
              <div class="mt-2 space-y-1">
                @for (attachment of msg.attachments; track attachment?.id || $index) {
                  @if (attachment?.url) {
                    <a 
                      [href]="attachment.url" 
                      target="_blank"
                      class="text-xs underline opacity-75 hover:opacity-100 flex items-center gap-1"
                    >
                      📎 {{ attachment.name || 'Fayl' }}
                    </a>
                  }
                }
              </div>
            }
          </div>
          
          <!-- Meta info -->
          <div class="flex items-center gap-2 mt-1 px-1">
            <span class="text-xs text-gray-400">
              {{ formatTime(msg.sentAt) }}
            </span>
            
            @if (msg.isPending) {
              <span class="text-xs text-amber-500">●</span>
            } @else if (msg.isRead) {
              <span class="text-xs text-indigo-500">✓✓</span>
            } @else if (msg.isDelivered) {
              <span class="text-xs text-gray-400">✓✓</span>
            } @else {
              <span class="text-xs text-gray-300">✓</span>
            }
            
            @if (msg.hasError) {
              <button 
                (click)="handleResend()"
                class="text-xs text-red-500 hover:text-red-600 underline"
              >
                Qayta yuborish
              </button>
            }
          </div>
        </div>
      </div>
    } @else {
      <!-- Invalid message placeholder -->
      <div class="message-placeholder p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div class="space-y-2 flex-1">
            <div class="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div class="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .message-bubble {
      word-break: break-word;
      max-width: 100%;
    }
    .whitespace-pre-wrap {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class SafeChatMessageComponent {
  @Input() message: Message | null | undefined;
  @Input() isOwn = false;
  @Input() currentUserId: string | null = null;
  @Input() senderName: string | null = null;
  @Input() senderAvatar: string | null = null;
  @Input() attachments: SafeAttachment[] | null = null;
  @Input() isPending = false;
  @Input() isDelivered = false;
  @Input() hasError = false;
  @Output() resend = new EventEmitter<string>();

  // Safe getter with comprehensive null checks
  get safeMessage(): SafeMessage | null {
    if (!this.message || typeof this.message !== 'object') {
      return null;
    }

    const m = this.message;

    return {
      id: m.id || `temp-${Date.now()}`,
      content: m.content || '',
      senderId: m.senderId || 'unknown',
      senderName: this.senderName || 'Unknown',
      senderAvatar: this.senderAvatar,
      sentAt: m.createdDate || new Date().toISOString(),
      isOwn: this.isOwn || (m.senderId === this.currentUserId),
      isRead: m.isRead || false,
      isDelivered: this.isDelivered,
      isPending: this.isPending,
      hasError: this.hasError,
      attachments: this.safeAttachments(this.attachments)
    };
  }

  hasContent(): string | null {
    const msg = this.safeMessage;
    if (!msg) return null;
    
    const content = msg.content?.trim();
    return content && content !== '' ? content : null;
  }

  hasAttachments(): boolean {
    const msg = this.safeMessage;
    return !!msg && Array.isArray(msg.attachments) && msg.attachments.length > 0;
  }

  private safeAttachments(attachments: any): SafeAttachment[] | null {
    if (!attachments || !Array.isArray(attachments)) {
      return null;
    }
    
    return attachments
      .filter(a => a && typeof a === 'object')
      .map(a => ({
        id: a.id || `att-${Date.now()}`,
        url: a.url || a.fileUrl || null,
        name: a.name || a.fileName || 'Fayl',
        type: a.type || a.fileType || 'application/octet-stream'
      }))
      .filter(a => a.url !== null); // Only include attachments with URLs
  }

  formatTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  }

  handleResend(): void {
    const msg = this.safeMessage;
    if (msg && msg.id) {
      this.resend.emit(msg.id);
    }
  }
}

// Internal interfaces for safe data
interface SafeMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  sentAt: string;
  isOwn: boolean;
  isRead: boolean;
  isDelivered: boolean;
  isPending: boolean;
  hasError: boolean;
  attachments: SafeAttachment[] | null;
}

interface SafeAttachment {
  id: string;
  url: string;
  name: string;
  type: string;
}
