import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';

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

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private hubConnection: HubConnection;
  private messages$ = new BehaviorSubject<Message[]>([]);
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private currentConversation$ = new BehaviorSubject<string | null>(null);
  private conversations$ = new BehaviorSubject<Conversation[]>([]);
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem('access_token') || '',
        skipNegotiation: true,
        transport: HttpTransportType.LongPolling
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
    });

    this.hubConnection.on('MessageSent', (message: Message) => {
      const current = this.messages$.value;
      this.messages$.next([...current, message]);
    });

    this.hubConnection.on('UserTyping', (userId: string, isTyping: boolean) => {
      // Handle typing indicator
      console.log(`User ${userId} is typing: ${isTyping}`);
    });

    this.hubConnection.on('MessageRead', (messageId: string) => {
      // Handle message read
      console.log(`Message ${messageId} was read`);
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionStatus$.next(false);
      console.log('Chat hub reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionStatus$.next(true);
      console.log('Chat hub reconnected');
    });

    this.hubConnection.onclose(() => {
      this.connectionStatus$.next(false);
      console.log('Chat hub connection closed');
    });
  }

  async startConnection(): Promise<void> {
    try {
      // Check if user is authenticated before connecting
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('No access token found, skipping SignalR connection');
        this.connectionStatus$.next(false);
        return;
      }

      // Temporarily disable SignalR for development
      console.warn('SignalR chat temporarily disabled for development');
      this.connectionStatus$.next(false);
      return;

      // Check if connection is already started
      if (this.hubConnection.state === 'Connected') {
        console.log('Chat hub already connected');
        this.connectionStatus$.next(true);
        return;
      }

      // Stop connection if it's in a connecting state
      if (this.hubConnection.state === 'Connecting') {
        await this.hubConnection.stop();
      }

      await this.hubConnection.start();
      this.connectionStatus$.next(true);
      console.log('Chat hub connection started');
    } catch (err) {
      console.error('Chat hub connection failed:', err);
      this.connectionStatus$.next(false);
      // Don't retry if unauthorized or already connected
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('not in the \'Disconnected\' state'))) {
        console.warn('Connection error, skipping retry:', err.message);
        return;
      }
      // Retry after 5 seconds for other errors
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  async sendMessage(receiverId: string, content: string): Promise<void> {
    try {
      await this.hubConnection.invoke('SendMessage', receiverId, content);
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }

  async sendTypingIndicator(receiverId: string, isTyping: boolean): Promise<void> {
    try {
      await this.hubConnection.invoke('SendTypingIndicator', receiverId, isTyping);
    } catch (err) {
      console.error('Failed to send typing indicator:', err);
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.hubConnection.invoke('MarkAsRead', messageId);
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  }

  async joinPropertyRoom(propertyId: string): Promise<void> {
    try {
      await this.hubConnection.invoke('JoinPropertyRoom', propertyId);
    } catch (err) {
      console.error('Failed to join property room:', err);
    }
  }

  async leavePropertyRoom(propertyId: string): Promise<void> {
    try {
      await this.hubConnection.invoke('LeavePropertyRoom', propertyId);
    } catch (err) {
      console.error('Failed to leave property room:', err);
    }
  }

  loadConversations(): void {
    // Temporarily disable conversations loading for development
    console.warn('Conversations loading temporarily disabled for development');
    this.conversations$.next([]);
    return;

    this.http.get<Conversation[]>(`${environment.apiUrl}/messages/conversations`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.conversations$.next(conversations);
        },
        error: (err) => {
          console.error('Failed to load conversations:', err);
        }
      });
  }

  loadConversationMessages(otherUserId: string): void {
    this.http.get<Message[]>(`${environment.apiUrl}/messages/conversation/${otherUserId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.messages$.next(messages);
        },
        error: (err) => {
          console.error('Failed to load conversation messages:', err);
        }
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

  setCurrentConversation(userId: string | null): void {
    this.currentConversation$.next(userId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
