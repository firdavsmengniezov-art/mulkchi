import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';

/**
 * Chat Message Interface
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  readAt?: string;
  createdDate: string;
  updatedDate?: string;
  senderName?: string;
  senderAvatar?: string;
}

/**
 * Conversation Interface
 */
export interface ChatConversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  isOnline?: boolean;
}

/**
 * Signal-based Chat Agent Service
 * Manages real-time chat state using Angular Signals
 */
@Injectable({ providedIn: 'root' })
export class ChatAgent {
  private hubConnection!: HubConnection;
  private logger = inject(LoggingService);
  private authService = inject(AuthService);

  // ============ STATE SIGNALS ============
  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _conversations = signal<ChatConversation[]>([]);
  private readonly _currentConversationId = signal<string | null>(null);
  private readonly _typingUsers = signal<Set<string>>(new Set());
  private readonly _isConnected = signal<boolean>(false);
  private readonly _isConnecting = signal<boolean>(false);
  private readonly _connectionError = signal<string | null>(null);

  // ============ PUBLIC READABLE SIGNALS ============
  readonly messages = this._messages.asReadonly();
  readonly conversations = this._conversations.asReadonly();
  readonly currentConversationId = this._currentConversationId.asReadonly();
  readonly typingUsers = this._typingUsers.asReadonly();
  readonly isConnected = this._isConnected.asReadonly();
  readonly isConnecting = this._isConnecting.asReadonly();
  readonly connectionError = this._connectionError.asReadonly();

  // ============ COMPUTED VALUES ============
  readonly currentMessages = computed(() => {
    const convId = this._currentConversationId();
    if (!convId) return [];
    return this._messages().filter(m => m.conversationId === convId);
  });

  readonly totalUnreadCount = computed(() => {
    return this._conversations().reduce((sum, conv) => sum + conv.unreadCount, 0);
  });

  readonly hasUnreadMessages = computed(() => this.totalUnreadCount() > 0);

  readonly isTypingInCurrentConversation = computed(() => {
    const currentConv = this._currentConversationId();
    if (!currentConv) return false;
    const conversation = this._conversations().find(c => c.id === currentConv);
    if (!conversation) return false;
    return this._typingUsers().has(conversation.otherUserId);
  });

  // ============ OBSERVABLE INTEROP ============
  messages$ = toObservable(this._messages);
  conversations$ = toObservable(this._conversations);
  currentConversationId$ = toObservable(this._currentConversationId);

  constructor() {
    this.initializeHub();
  }

  private initializeHub(): void {
    const tokenFactory = () => this.authService.getToken() ?? '';
    const hubUrl = environment.hubUrl || environment.apiUrl.replace('/api', '');

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${hubUrl}/hubs/chat`, { accessTokenFactory: tokenFactory })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.setupHubListeners();
  }

  private setupHubListeners(): void {
    // Receive new message
    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      this.logger.log('SignalR: New message received', message);
      this._messages.update(messages => [...messages, message]);
      this.updateConversationFromMessage(message);
    });

    // Message sent confirmation
    this.hubConnection.on('MessageSent', (message: ChatMessage) => {
      this.logger.log('SignalR: Message sent confirmation', message);
      this._messages.update(messages => {
        const exists = messages.find(m => m.id === message.id);
        if (exists) {
          return messages.map(m => m.id === message.id ? message : m);
        }
        return [...messages, message];
      });
    });

    // User typing indicator
    this.hubConnection.on('UserTyping', (userId: string) => {
      this._typingUsers.update(users => {
        const newUsers = new Set(users);
        newUsers.add(userId);
        return newUsers;
      });

      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        this._typingUsers.update(users => {
          const newUsers = new Set(users);
          newUsers.delete(userId);
          return newUsers;
        });
      }, 3000);
    });

    // Message read status
    this.hubConnection.on('MessageRead', (data: { messageId: string; readAt: string }) => {
      this._messages.update(messages =>
        messages.map(m =>
          m.id === data.messageId ? { ...m, isRead: true, readAt: data.readAt } : m
        )
      );
    });

    // Connection events
    this.hubConnection.onreconnecting(() => {
      this.logger.log('SignalR: Chat hub reconnecting...');
      this._isConnected.set(false);
      this._isConnecting.set(true);
    });

    this.hubConnection.onreconnected(() => {
      this.logger.log('SignalR: Chat hub reconnected');
      this._isConnected.set(true);
      this._isConnecting.set(false);
      this._connectionError.set(null);

      // Rejoin current conversation if any
      const currentConv = this._currentConversationId();
      if (currentConv) {
        this.joinConversation(currentConv);
      }
    });

    this.hubConnection.onclose((error) => {
      this.logger.error('SignalR: Chat hub closed', error);
      this._isConnected.set(false);
      this._isConnecting.set(false);
      this._connectionError.set(error?.message || 'Connection closed');
    });
  }

  // ============ CONNECTION METHODS ============

  async startConnection(): Promise<void> {
    if (this._isConnecting() || this._isConnected()) {
      this.logger.log('ChatAgent: Connection already in progress or established');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.logger.log('ChatAgent: User not authenticated, skipping connection');
      return;
    }

    this._isConnecting.set(true);
    this._connectionError.set(null);

    try {
      await this.hubConnection.start();
      this._isConnected.set(true);
      this._isConnecting.set(false);
      this.logger.log('ChatAgent: SignalR connection established');
    } catch (err: any) {
      this.logger.error('ChatAgent: SignalR connection failed', err);
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
      this.logger.log('ChatAgent: SignalR connection stopped');
    } catch (err) {
      this.logger.error('ChatAgent: Error stopping SignalR connection', err);
    }
  }

  // ============ CHAT ACTIONS ============

  async sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<void> {
    if (!this._isConnected()) {
      this.logger.warn('ChatAgent: Cannot send message - not connected');
      throw new Error('Not connected to chat server');
    }

    try {
      await this.hubConnection.invoke('SendMessage', {
        conversationId,
        content,
        type
      });
    } catch (err) {
      this.logger.error('ChatAgent: Failed to send message', err);
      throw err;
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (!this._isConnected()) {
      this.logger.warn('ChatAgent: Cannot join conversation - not connected');
      return;
    }

    // Leave previous conversation
    const currentConv = this._currentConversationId();
    if (currentConv && currentConv !== conversationId) {
      await this.leaveConversation(currentConv);
    }

    try {
      await this.hubConnection.invoke('JoinConversation', conversationId);
      this._currentConversationId.set(conversationId);
      this.logger.log('ChatAgent: Joined conversation', conversationId);
    } catch (err) {
      this.logger.error('ChatAgent: Failed to join conversation', err);
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (!this._isConnected()) return;

    try {
      await this.hubConnection.invoke('LeaveConversation', conversationId);
      this.logger.log('ChatAgent: Left conversation', conversationId);
    } catch (err) {
      this.logger.error('ChatAgent: Failed to leave conversation', err);
    }
  }

  async startTyping(conversationId: string): Promise<void> {
    if (!this._isConnected()) return;

    try {
      await this.hubConnection.invoke('StartTyping', conversationId);
    } catch (err) {
      this.logger.error('ChatAgent: Failed to send typing indicator', err);
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    if (!this._isConnected()) return;

    try {
      await this.hubConnection.invoke('MarkAsRead', messageId);
      this._messages.update(messages =>
        messages.map(m => m.id === messageId ? { ...m, isRead: true } : m)
      );
    } catch (err) {
      this.logger.error('ChatAgent: Failed to mark message as read', err);
    }
  }

  // ============ STATE MANAGEMENT ============

  setCurrentConversation(conversationId: string | null): void {
    if (conversationId !== this._currentConversationId()) {
      if (conversationId) {
        this.joinConversation(conversationId);
      }
      this._currentConversationId.set(conversationId);
    }
  }

  setConversations(conversations: ChatConversation[]): void {
    this._conversations.set(conversations);
  }

  setMessages(messages: ChatMessage[]): void {
    this._messages.set(messages);
  }

  clearMessages(): void {
    this._messages.set([]);
  }

  clearCurrentConversation(): void {
    const currentConv = this._currentConversationId();
    if (currentConv) {
      this.leaveConversation(currentConv);
    }
    this._currentConversationId.set(null);
  }

  // ============ PRIVATE HELPERS ============

  private updateConversationFromMessage(message: ChatMessage): void {
    this._conversations.update(conversations => {
      const existingIndex = conversations.findIndex(c => c.id === message.conversationId);

      if (existingIndex >= 0) {
        // Update existing conversation
        const updated = [...conversations];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message.content,
          lastMessageDate: message.createdDate,
          unreadCount: message.conversationId !== this._currentConversationId()
            ? updated[existingIndex].unreadCount + 1
            : updated[existingIndex].unreadCount
        };
        // Sort by last message date
        return updated.sort((a, b) =>
          new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime()
        );
      }

      return conversations;
    });
  }
}
