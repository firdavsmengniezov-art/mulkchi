import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  isRead: boolean;
  readAt?: string;
  createdDate: string;
  updatedDate: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp?: string;
}

export interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

export interface TypingIndicator {
  userId: string;
  isTyping: boolean;
}

export interface ChatAttachmentUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private hubConnection: HubConnection;
  private messages$ = new BehaviorSubject<Message[]>([]);
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private currentConversation$ = new BehaviorSubject<string | null>(null);
  private conversations$ = new BehaviorSubject<Conversation[]>([]);
  /** Tracks which users are currently typing */
  private typingIndicators$ = new BehaviorSubject<TypingIndicator[]>([]);
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private logger: LoggingService,
  ) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/chat`, {
        accessTokenFactory: () => this.authService.getToken() || '',
        // Do NOT set skipNegotiation when using LongPolling —
        // skipNegotiation is only valid for pure WebSocket transport.
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.setupHubListeners();
  }

  private setupHubListeners(): void {
    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      const current = this.messages$.value;
      this.messages$.next([...current, message]);
      this.upsertConversationFromMessage(message);
    });

    this.hubConnection.on('MessageSent', (message: Message) => {
      const current = this.messages$.value;
      this.messages$.next([...current, message]);
      this.upsertConversationFromMessage(message);
    });

    this.hubConnection.on('UserTyping', (userId: string, isTyping: boolean) => {
      const current = this.typingIndicators$.value.filter((t) => t.userId !== userId);
      if (isTyping) {
        this.typingIndicators$.next([...current, { userId, isTyping: true }]);
      } else {
        this.typingIndicators$.next(current);
      }
    });

    this.hubConnection.on(
      'MessageRead',
      (payload: string | { messageId: string; readAt?: string }) => {
        const messageId = typeof payload === 'string' ? payload : payload.messageId;
        const readAt = typeof payload === 'string' ? new Date().toISOString() : payload.readAt;

        const updated = this.messages$.value.map((m) =>
          m.id === messageId ? { ...m, isRead: true, readAt } : m,
        );
        this.messages$.next(updated);
      },
    );

    this.hubConnection.onreconnecting(() => {
      this.connectionStatus$.next(false);
    });

    this.hubConnection.onreconnected(() => {
      this.connectionStatus$.next(true);
    });

    this.hubConnection.onclose(() => {
      this.connectionStatus$.next(false);
    });
  }

  async startConnection(): Promise<void> {
    try {
      if (!this.authService.isAuthenticated() || !this.authService.getToken()) {
        this.logger.warn('No access token found, skipping SignalR connection');
        this.connectionStatus$.next(false);
        return;
      }

      if (this.hubConnection.state === 'Connected') {
        this.connectionStatus$.next(true);
        return;
      }

      if (this.hubConnection.state === 'Connecting') {
        await this.hubConnection.stop();
      }

      await this.hubConnection.start();
      this.connectionStatus$.next(true);
    } catch (err) {
      this.logger.error('Chat hub connection failed:', err);
      this.connectionStatus$.next(false);
      if (
        err instanceof Error &&
        (err.message.includes('401') || err.message.includes("not in the 'Disconnected' state"))
      ) {
        return;
      }
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  async sendMessage(receiverId: string, content: string): Promise<void> {
    try {
      await this.hubConnection.invoke('SendMessage', receiverId, content);
    } catch (err) {
      this.logger.error('Failed to send message:', err);
      throw err;
    }
  }

  async sendFileMessage(receiverId: string, fileUrl: string, fileName: string): Promise<void> {
    try {
      await this.hubConnection.invoke('SendFileMessage', receiverId, fileUrl, fileName);
    } catch (err) {
      this.logger.error('Failed to send file message:', err);
      throw err;
    }
  }

  uploadAttachment(file: File): Observable<ChatAttachmentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ChatAttachmentUploadResponse>(
      `${environment.apiUrl}/messages/upload-attachment`,
      formData,
    );
  }

  async sendTypingIndicator(receiverId: string, isTyping: boolean): Promise<void> {
    try {
      await this.hubConnection.invoke('SendTypingIndicator', receiverId, isTyping);
    } catch (err) {
      this.logger.error('Failed to send typing indicator:', err);
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.hubConnection.invoke('MarkAsRead', messageId);
    } catch (err) {
      this.logger.error('Failed to mark message as read:', err);
    }
  }

  async joinPropertyRoom(propertyId: string): Promise<void> {
    try {
      await this.hubConnection.invoke('JoinPropertyRoom', propertyId);
    } catch (err) {
      this.logger.error('Failed to join property room:', err);
    }
  }

  async leavePropertyRoom(propertyId: string): Promise<void> {
    try {
      await this.hubConnection.invoke('LeavePropertyRoom', propertyId);
    } catch (err) {
      this.logger.error('Failed to leave property room:', err);
    }
  }

  loadConversations(): void {
    this.http
      .get<Conversation[]>(`${environment.apiUrl}/messages/conversations`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.conversations$.next(conversations);
        },
        error: (err) => {
          this.logger.error('Failed to load conversations:', err);
        },
      });
  }

  loadConversationMessages(otherUserId: string): void {
    this.http
      .get<Message[]>(`${environment.apiUrl}/messages/conversation/${otherUserId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.messages$.next(messages);
        },
        error: (err) => {
          this.logger.error('Failed to load conversation messages:', err);
        },
      });
  }

  getMessages(): Observable<Message[]> {
    return this.messages$.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  getCurrentConversation(): Observable<string | null> {
    return this.currentConversation$.asObservable();
  }

  getConversations(): Observable<Conversation[]> {
    return this.conversations$.asObservable();
  }

  /** Returns an observable of currently-typing users in the active conversation. */
  getTypingIndicators(): Observable<TypingIndicator[]> {
    return this.typingIndicators$.asObservable();
  }

  setCurrentConversation(userId: string | null): void {
    this.currentConversation$.next(userId);
    // Clear typing indicators when switching conversations
    this.typingIndicators$.next([]);
  }

  private upsertConversationFromMessage(message: Message): void {
    const currentUserId = this.authService.getCurrentUser()?.id;
    if (!currentUserId) {
      return;
    }

    const otherUserId = message.senderId === currentUserId ? message.receiverId : message.senderId;
    const existingConversations = [...this.conversations$.value];
    const existingIndex = existingConversations.findIndex((c) => c.otherUserId === otherUserId);
    const unreadCount = message.receiverId === currentUserId ? 1 : 0;

    const mapPreview = (incomingMessage: Message): string => {
      const normalizedType = `${incomingMessage.type ?? ''}`.toLowerCase();
      if (normalizedType === 'file' || normalizedType === '2') {
        return 'Ilova yuborildi';
      }

      return incomingMessage.content;
    };

    if (existingIndex >= 0) {
      const existing = existingConversations[existingIndex];
      const updatedConversation: Conversation = {
        ...existing,
        lastMessage: mapPreview(message),
        lastMessageDate: message.createdDate,
        unreadCount:
          message.receiverId === currentUserId
            ? this.currentConversation$.value === otherUserId
              ? 0
              : existing.unreadCount + 1
            : existing.unreadCount,
      };

      existingConversations.splice(existingIndex, 1);
      this.conversations$.next([updatedConversation, ...existingConversations]);
      return;
    }

    const newConversation: Conversation = {
      otherUserId,
      otherUserName: message.senderName ?? 'Suhbatdosh',
      otherUserAvatar: message.senderAvatar,
      lastMessage: mapPreview(message),
      lastMessageDate: message.createdDate,
      unreadCount: this.currentConversation$.value === otherUserId ? 0 : unreadCount,
    };

    this.conversations$.next([newConversation, ...existingConversations]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
