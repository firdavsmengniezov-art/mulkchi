import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { Message } from '../models';
import { AuthService } from './auth.service';

export interface NotificationPayload {
  id: string;
  type: string;
  message: string;
  createdDate: string;
}

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private chatHub!: HubConnection;
  private notifHub!: HubConnection;
  private messageSubject = new Subject<Message>();
  private typingSubject = new Subject<string>();
  private notificationSubject = new Subject<NotificationPayload>();
  private isConnected = false;

  message$ = this.messageSubject.asObservable();
  typing$ = this.typingSubject.asObservable();
  notification$ = this.notificationSubject.asObservable();

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  async startConnections(): Promise<void> {
    // The access token is kept in memory by AuthService (never in localStorage).
    // It is refreshed transparently when the session is restored on app startup.
    const tokenFactory = () => this.authService.getToken() ?? '';

    this.chatHub = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/chat`, { accessTokenFactory: tokenFactory })
      .withAutomaticReconnect()
      .build();

    this.notifHub = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/notifications`, { accessTokenFactory: tokenFactory })
      .withAutomaticReconnect()
      .build();

    this.chatHub.on('ReceiveMessage', (msg: Message) => this.messageSubject.next(msg));
    this.chatHub.on('UserTyping', (userId: string) => this.typingSubject.next(userId));
    this.notifHub.on('ReceiveNotification', (n: NotificationPayload) => this.notificationSubject.next(n));

    await this.startHubWithRetry(this.chatHub, 'Chat Hub');
    await this.startHubWithRetry(this.notifHub, 'Notification Hub');
  }

  private async startHubWithRetry(hub: HubConnection, hubName: string, maxRetries = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await hub.start();
        console.log(`${hubName} connected successfully`);
        this.isConnected = true;
        return;
      } catch (err) {
        console.error(`${hubName} connection attempt ${i + 1} failed:`, err);
        if (i === maxRetries - 1) {
          this.isConnected = false;
          this.snackBar.open(
            `${hubName} ulanmadi. Internet aloqangizni tekshiring va sahifani yangilang.`,
            'X',
            { duration: 5000 }
          );
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
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
      console.error('Error stopping SignalR connections:', err);
    }
  }
}

