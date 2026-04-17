import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message } from '../models';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';

export interface NotificationPayload {
  id: string;
  type: string;
  message: string;
  body?: string;
  title?: string;
  createdDate: string;
}

export interface SignalRConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastError?: string;
  retryCount: number;
}

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private chatHub!: HubConnection;
  private notifHub!: HubConnection;
  private messageSubject = new Subject<Message>();
  private typingSubject = new Subject<string>();
  private notificationSubject = new Subject<NotificationPayload>();
  private isConnected = false;
  private isConnecting = false;
  private connectionState$ = new Subject<SignalRConnectionState>();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 3000;
  private fallbackMode = false; // HTTP polling fallback

  message$ = this.messageSubject.asObservable();
  typing$ = this.typingSubject.asObservable();
  notification$ = this.notificationSubject.asObservable();
  connectionStateObservable$ = this.connectionState$.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private logger: LoggingService,
  ) {}

  async startConnections(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      this.logger.log('SignalR connections already in progress or established');
      return;
    }

    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      this.logger.log('Skipping SignalR connections: User not authenticated');
      this.updateConnectionState({ isConnected: false, isConnecting: false, retryCount: 0 });
      return;
    }

    this.isConnecting = true;
    this.updateConnectionState({ isConnected: false, isConnecting: true, retryCount: 0 });

    // AuthService keeps the access token synced with localStorage so SignalR can reuse it.
    const tokenFactory = () => this.authService.getToken() ?? '';

    const hubUrl = environment.hubUrl || '';
    
    // Validate hub URL
    if (!hubUrl && !environment.apiUrl) {
      this.logger.error('SignalR: No hub URL or API URL configured');
      this.enableFallbackMode('No hub URL configured');
      return;
    }

    // Use apiUrl as fallback for hubUrl if hubUrl is empty
    const baseUrl = hubUrl || environment.apiUrl.replace('/api', '');

    try {
      this.chatHub = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/chat`, { accessTokenFactory: tokenFactory })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging({
          log: (logLevel, message) => {
            if (logLevel >= 2) { // Warning and above
              this.logger.log(`SignalR Chat: ${message}`);
            }
          }
        })
        .build();

      this.notifHub = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/notifications`, { accessTokenFactory: tokenFactory })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging({
          log: (logLevel, message) => {
            if (logLevel >= 2) { // Warning and above
              this.logger.log(`SignalR Notifications: ${message}`);
            }
          }
        })
        .build();

      // Setup event handlers with safety checks
      this.setupEventHandlers();

      // Start connections with retry logic
      const chatConnected = await this.startHubWithRetry(this.chatHub, 'Chat Hub');
      const notifConnected = await this.startHubWithRetry(this.notifHub, 'Notification Hub');

      this.isConnected = chatConnected && notifConnected;
      this.isConnecting = false;

      if (this.isConnected) {
        this.updateConnectionState({ isConnected: true, isConnecting: false, retryCount: 0 });
        this.fallbackMode = false;
      } else {
        this.enableFallbackMode('Failed to establish SignalR connections');
      }
    } catch (err) {
      this.logger.error('SignalR initialization error:', err);
      this.isConnecting = false;
      this.enableFallbackMode('SignalR initialization failed');
    }
  }

  private setupEventHandlers(): void {
    // Chat Hub handlers with null/undefined checks
    this.chatHub.on('ReceiveMessage', (msg: Message | null | undefined) => {
      if (!msg || typeof msg !== 'object') {
        this.logger.warn('Received invalid message from SignalR');
        return;
      }
      this.messageSubject.next(msg);
    });

    this.chatHub.on('UserTyping', (userId: string | null | undefined) => {
      if (!userId || typeof userId !== 'string') {
        return;
      }
      this.typingSubject.next(userId);
    });

    // Notification Hub handlers with safety checks
    this.notifHub.on('ReceiveNotification', (n: NotificationPayload | null | undefined) => {
      if (!n || typeof n !== 'object') {
        this.logger.warn('Received invalid notification from SignalR');
        return;
      }
      // Ensure required fields exist
      if (!n.id || !n.message) {
        this.logger.warn('Notification missing required fields');
        return;
      }
      this.notificationSubject.next(n);
    });

    // Handle connection events
    this.chatHub.onreconnecting((error) => {
      this.logger.log('Chat Hub reconnecting...', error);
      this.updateConnectionState({ isConnected: false, isConnecting: true, retryCount: 0 });
    });

    this.chatHub.onreconnected((connectionId) => {
      this.logger.log('Chat Hub reconnected', connectionId);
      this.isConnected = true;
      this.updateConnectionState({ isConnected: true, isConnecting: false, retryCount: 0 });
    });

    this.chatHub.onclose((error) => {
      this.logger.log('Chat Hub closed', error);
      this.isConnected = false;
      this.updateConnectionState({ isConnected: false, isConnecting: false, retryCount: 0, lastError: error?.message });
    });
  }

  private updateConnectionState(state: Partial<SignalRConnectionState>): void {
    const currentState: SignalRConnectionState = {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      retryCount: 0,
      ...state
    };
    this.connectionState$.next(currentState);
  }

  private enableFallbackMode(reason: string): void {
    this.fallbackMode = true;
    this.isConnected = false;
    this.isConnecting = false;
    this.updateConnectionState({ 
      isConnected: false, 
      isConnecting: false, 
      retryCount: 0, 
      lastError: reason 
    });
    this.logger.warn('SignalR fallback mode enabled:', reason);
    
    // Show user-friendly message
    this.snackBar.open(
      'Real-time yangilanishlar vaqtinchalik o\'chirildi. Internet aloqangizni tekshiring.',
      'Yopish',
      { duration: 8000, panelClass: 'warning-snackbar' }
    );
  }

  private async startHubWithRetry(
    hub: HubConnection,
    hubName: string,
  ): Promise<boolean> {
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        // Check if hub is already connected
        if (hub.state === 'Connected') {
          this.logger.log(`${hubName} already connected`);
          return true;
        }

        await hub.start();
        this.logger.log(`${hubName} connected successfully`);
        return true;
      } catch (err: any) {
        const errorMessage = err?.message || 'Unknown error';
        const is404 = errorMessage.includes('404') || errorMessage.includes('Not Found');
        const isAuthError = errorMessage.includes('401') || errorMessage.includes('Unauthorized');
        
        this.logger.error(`${hubName} connection attempt ${i + 1}/${this.MAX_RETRIES} failed:`, {
          error: errorMessage,
          status: err?.statusCode,
          is404,
          isAuthError
        });

        // Don't retry on 404 errors - endpoint doesn't exist
        if (is404) {
          this.logger.error(`${hubName} endpoint not found (404). Stopping retries.`);
          return false;
        }

        // Don't retry on auth errors
        if (isAuthError) {
          this.logger.error(`${hubName} authentication failed.`);
          return false;
        }

        if (i < this.MAX_RETRIES - 1) {
          this.updateConnectionState({ 
            isConnected: false, 
            isConnecting: true, 
            retryCount: i + 1,
            lastError: errorMessage
          });
          await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }
    
    return false;
  }

  isInFallbackMode(): boolean {
    return this.fallbackMode;
  }

  async reconnect(): Promise<void> {
    if (this.fallbackMode || !this.isConnected) {
      this.logger.log('Attempting SignalR reconnection...');
      await this.stopConnections();
      await this.startConnections();
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  joinConversation(conversationId: string): void {
    if (this.chatHub?.state === 'Connected') {
      this.chatHub.invoke('JoinConversation', conversationId);
    }
  }

  sendMessage(conversationId: string, message: string): void {
    if (this.chatHub?.state === 'Connected') {
      this.chatHub.invoke('SendMessage', conversationId, message);
    }
  }

  startTyping(conversationId: string): void {
    if (this.chatHub?.state === 'Connected') {
      this.chatHub.invoke('StartTyping', conversationId);
    }
  }

  stopTyping(conversationId: string): void {
    if (this.chatHub?.state === 'Connected') {
      this.chatHub.invoke('StopTyping', conversationId);
    }
  }

  async stopConnections(): Promise<void> {
    try {
      await this.chatHub?.stop();
      await this.notifHub?.stop();
      this.isConnected = false;
    } catch (err) {
      this.logger.error('Error stopping SignalR connections:', err);
    }
  }
}
