import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { Message, Notification } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private chatHubConnection: HubConnection | null = null;
  private notificationHubConnection: HubConnection | null = null;

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private typingUsersSubject = new BehaviorSubject<Set<string>>(new Set());
  public typingUsers$ = this.typingUsersSubject.asObservable();

  constructor(private authService: AuthService) {}

  async initializeChatHub(): Promise<void> {
    if (!this.authService.isLoggedIn) return;

    this.chatHubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5009/hubs/chat')
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.chatHubConnection.on('ReceiveMessage', (message: Message) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.chatHubConnection.on('UserTyping', (userId: string) => {
      const currentTypingUsers = new Set(this.typingUsersSubject.value);
      currentTypingUsers.add(userId);
      this.typingUsersSubject.next(currentTypingUsers);
    });

    this.chatHubConnection.on('UserStoppedTyping', (userId: string) => {
      const currentTypingUsers = new Set(this.typingUsersSubject.value);
      currentTypingUsers.delete(userId);
      this.typingUsersSubject.next(currentTypingUsers);
    });

    try {
      await this.chatHubConnection.start();
      console.log('Chat hub connected');
    } catch (error) {
      console.error('Error connecting to chat hub:', error);
    }
  }

  async initializeNotificationHub(): Promise<void> {
    if (!this.authService.isLoggedIn) return;

    this.notificationHubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5009/hubs/notifications')
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.notificationHubConnection.on('ReceiveNotification', (notification: Notification) => {
      const currentNotifications = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...currentNotifications]);
    });

    this.notificationHubConnection.on('BroadcastAnnouncement', (message: string) => {
      const announcement: Notification = {
        id: Date.now().toString(),
        userId: this.authService.currentUser?.id || '',
        title: 'E\'lon',
        body: message,
        isRead: false,
        createdDate: new Date().toISOString()
      };
      const currentNotifications = this.notificationsSubject.value;
      this.notificationsSubject.next([announcement, ...currentNotifications]);
    });

    try {
      await this.notificationHubConnection.start();
      console.log('Notification hub connected');
    } catch (error) {
      console.error('Error connecting to notification hub:', error);
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (this.chatHubConnection) {
      await this.chatHubConnection.invoke('JoinConversation', conversationId);
    }
  }

  async sendMessage(conversationId: string, message: string): Promise<void> {
    if (this.chatHubConnection) {
      await this.chatHubConnection.invoke('SendMessage', conversationId, message);
    }
  }

  async startTyping(conversationId: string): Promise<void> {
    if (this.chatHubConnection) {
      await this.chatHubConnection.invoke('StartTyping', conversationId);
    }
  }

  async stopTyping(conversationId: string): Promise<void> {
    if (this.chatHubConnection) {
      await this.chatHubConnection.invoke('StopTyping', conversationId);
    }
  }

  async disconnect(): Promise<void> {
    if (this.chatHubConnection) {
      await this.chatHubConnection.stop();
      this.chatHubConnection = null;
    }
    if (this.notificationHubConnection) {
      await this.notificationHubConnection.stop();
      this.notificationHubConnection = null;
    }
  }
}
