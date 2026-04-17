import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import {
  ChatService,
  Conversation,
  Message,
  TypingIndicator,
} from '../../../core/services/chat.service';
import { LoggingService } from '../../../core/services/logging.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    MatIconModule,
    NavbarComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLTextAreaElement>;

  conversations: Conversation[] = [];
  messages: Message[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  isTyping = false;
  typingUsers: string[] = [];
  currentUserId = '';
  connectionStatus = false;
  loading = true;
  unreadCount = 0;
  emojiPickerOpen = false;
  selectedAttachmentName: string | null = null;
  private selectedAttachmentFile: File | null = null;
  searchQuery = '';
  isConversationPaneVisible = true;
  readonly quickEmojis = ['🙂', '😂', '❤️', '👍', '🙏', '🔥'];

  private pendingConversationUserId: string | null = null;
  private lastMessagesLength = 0;
  private destroy$ = new Subject<void>();
  private typingTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUserId = user?.id || '';
    });

    this.setupSubscriptions();

    this.chatService.startConnection();
    this.chatService.loadConversations();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.pendingConversationUserId = params.get('userId');
      this.trySelectPendingConversation();
    });
  }

  private setupSubscriptions(): void {
    this.chatService
      .getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.connectionStatus = status;
        if (status) {
          this.loading = false;
        }
      });

    this.chatService
      .getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversations) => {
        this.conversations = conversations;
        this.updateTotalUnreadCount();
        this.trySelectPendingConversation();
        this.loading = false;
      });

    this.chatService
      .getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((messages) => {
        this.messages = messages;
        this.markVisibleIncomingAsRead();
        this.scrollToBottom();
      });

    this.chatService
      .getTypingIndicators()
      .pipe(takeUntil(this.destroy$))
      .subscribe((indicators: TypingIndicator[]) => {
        this.typingUsers = indicators
          .filter((indicator) => indicator.userId !== this.currentUserId && indicator.isTyping)
          .map((indicator) => indicator.userId);
      });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    if (this.isMobileViewport) {
      this.isConversationPaneVisible = false;
    }
    this.emojiPickerOpen = false;
    this.selectedAttachmentName = null;
    this.selectedAttachmentFile = null;
    this.chatService.setCurrentConversation(conversation.otherUserId);
    this.chatService.loadConversationMessages(conversation.otherUserId);

    conversation.unreadCount = 0;
    this.updateTotalUnreadCount();
  }

  private trySelectPendingConversation(): void {
    if (!this.pendingConversationUserId) {
      return;
    }

    const conversation = this.conversations.find(
      (conv) => conv.otherUserId === this.pendingConversationUserId,
    );
    if (conversation) {
      this.selectConversation(conversation);
      this.pendingConversationUserId = null;
      return;
    }

    if (this.conversations.length > 0) {
      this.createNewConversation(this.pendingConversationUserId);
      this.pendingConversationUserId = null;
    }
  }

  selectConversationById(userId: string): void {
    const conversation = this.conversations.find((conv) => conv.otherUserId === userId);
    if (conversation) {
      this.selectConversation(conversation);
    } else {
      this.createNewConversation(userId);
    }
  }

  private createNewConversation(userId: string): void {
    const newConv: Conversation = {
      otherUserId: userId,
      otherUserName: 'Suhbatdosh',
      lastMessage: '',
      lastMessageDate: new Date().toISOString(),
      unreadCount: 0,
    };

    this.conversations.unshift(newConv);
    this.selectConversation(newConv);
  }

  async sendMessage(): Promise<void> {
    if (!this.selectedConversation) {
      return;
    }

    const messageText = this.newMessage.trim();
    const hasAttachment = Boolean(this.selectedAttachmentFile);
    if (!messageText && !hasAttachment) {
      return;
    }

    const receiverId = this.selectedConversation.otherUserId;

    try {
      if (this.selectedAttachmentFile) {
        const uploadResult = await firstValueFrom(
          this.chatService.uploadAttachment(this.selectedAttachmentFile),
        );

        await this.chatService.sendFileMessage(
          receiverId,
          uploadResult.fileUrl,
          uploadResult.fileName,
        );
      }

      if (messageText) {
        await this.chatService.sendMessage(receiverId, messageText);
      }

      this.newMessage = '';
      this.selectedAttachmentName = null;
      this.selectedAttachmentFile = null;
      this.emojiPickerOpen = false;
      this.stopTyping();
      this.resizeMessageInput();

      if (this.fileInput?.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    } catch (err) {
      this.logger.error('Failed to send message:', err);
    }
  }

  onTyping(): void {
    if (!this.selectedConversation) {
      return;
    }

    if (!this.isTyping) {
      this.isTyping = true;
      void this.chatService.sendTypingIndicator(this.selectedConversation.otherUserId, true);
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  private stopTyping(): void {
    if (this.isTyping && this.selectedConversation) {
      this.isTyping = false;
      void this.chatService.sendTypingIndicator(this.selectedConversation.otherUserId, false);
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  triggerFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedAttachmentFile = file ?? null;
    this.selectedAttachmentName = file?.name ?? null;
  }

  onMessageInput(): void {
    this.onTyping();
    this.resizeMessageInput();
  }

  toggleEmojiPicker(): void {
    this.emojiPickerOpen = !this.emojiPickerOpen;
  }

  appendEmoji(emoji: string): void {
    this.newMessage = `${this.newMessage}${emoji}`;
    this.emojiPickerOpen = false;
    this.resizeMessageInput();
  }

  get filteredConversations(): Conversation[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.conversations;
    }

    return this.conversations.filter((conversation) => {
      const name = conversation.otherUserName?.toLowerCase() ?? '';
      const lastMessage = conversation.lastMessage?.toLowerCase() ?? '';
      return name.includes(query) || lastMessage.includes(query);
    });
  }

  get isMobileViewport(): boolean {
    return typeof window !== 'undefined' ? window.innerWidth <= 1024 : false;
  }

  backToConversations(): void {
    this.isConversationPaneVisible = true;
  }

  getConversationStatusText(): string {
    return this.connectionStatus ? 'Online' : 'Oxirgi safar: bugun';
  }

  getConversationInitials(conversation: Conversation | null): string {
    if (!conversation?.otherUserName) {
      return 'M';
    }

    return (
      conversation.otherUserName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'M'
    );
  }

  getMessageTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  isFileMessage(message: Message): boolean {
    const normalizedType = `${message.type ?? ''}`.toLowerCase();
    return normalizedType === 'file' || normalizedType === '2';
  }

  getAttachmentUrl(message: Message): string {
    if (!this.isFileMessage(message)) {
      return '';
    }

    const [, fileUrl] = this.parseFileMessageContent(message.content);
    if (!fileUrl) {
      return '';
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    return `${environment.hubUrl}${fileUrl}`;
  }

  getAttachmentName(message: Message): string {
    if (!this.isFileMessage(message)) {
      return '';
    }

    const [fileName, fileUrl] = this.parseFileMessageContent(message.content);
    if (fileName) {
      return fileName;
    }

    const normalizedUrl = fileUrl || message.content;
    const urlParts = normalizedUrl.split('/');
    return urlParts[urlParts.length - 1] || 'Yuklab olish';
  }

  getTypingText(): string {
    if (this.typingUsers.length === 0) {
      return '';
    }

    if (this.typingUsers.length === 1) {
      return 'Yozmoqda';
    }

    return `${this.typingUsers.length} ta foydalanuvchi yozmoqda`;
  }

  getPropertyBadge(): string {
    return 'Mulk bo‘yicha suhbat';
  }

  getStatusText(): string {
    return this.connectionStatus ? 'Onlayn' : 'Ulanmagan';
  }

  trackByConversationId(_: number, item: Conversation): string {
    return item.otherUserId;
  }

  trackByMessageId(_: number, item: Message): string {
    return item.id;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private resizeMessageInput(): void {
    if (!this.messageInput) {
      return;
    }

    const input = this.messageInput.nativeElement;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  }

  ngAfterViewChecked(): void {
    if (this.messages.length !== this.lastMessagesLength) {
      this.lastMessagesLength = this.messages.length;
      this.scrollToBottom();
    }
  }

  private updateTotalUnreadCount(): void {
    this.unreadCount = this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }

  private markVisibleIncomingAsRead(): void {
    if (!this.selectedConversation) {
      return;
    }

    for (const message of this.messages) {
      const isIncoming = message.senderId === this.selectedConversation.otherUserId;
      if (isIncoming && !message.isRead) {
        void this.chatService.markAsRead(message.id);
      }
    }
  }

  private parseFileMessageContent(content: string): [string, string] {
    const separatorIndex = content.indexOf('|');
    if (separatorIndex < 0) {
      return ['', content.trim()];
    }

    const fileName = content.slice(0, separatorIndex).trim();
    const fileUrl = content.slice(separatorIndex + 1).trim();
    return [fileName, fileUrl];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }
}
