import * as signalR from '@microsoft/signalr';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../models/message.models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly authService = inject(AuthService);
  private hubConnection: signalR.HubConnection | null = null;
  private messagesSubject = new BehaviorSubject<Message[]>([]);

  readonly messages$: Observable<Message[]> = this.messagesSubject.asObservable();

  startConnection(): void {
    if (this.hubConnection) return;

    const hubUrl = environment.hubUrl;
    const token = this.authService.getToken();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (message: Message) => {
      const current = this.messagesSubject.getValue();
      this.messagesSubject.next([...current, message]);
    });

    this.hubConnection
      .start()
      .catch((err) => console.error('SignalR connection error:', err));
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  sendMessage(receiverId: string, content: string, propertyId?: string): void {
    if (!this.hubConnection) return;
    this.hubConnection
      .invoke('SendMessage', receiverId, content, propertyId ?? null)
      .catch((err) => console.error('SendMessage error:', err));
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
  }
}
