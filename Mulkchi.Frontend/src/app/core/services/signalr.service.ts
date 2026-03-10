import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message } from '../models';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private chatHub!: HubConnection;
  private notifHub!: HubConnection;
  private messageSubject = new Subject<any>();
  private typingSubject = new Subject<string>();
  private notificationSubject = new Subject<any>();

  message$ = this.messageSubject.asObservable();
  typing$ = this.typingSubject.asObservable();
  notification$ = this.notificationSubject.asObservable();

  startConnections(token: string): void {
    this.chatHub = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/chat`, { accessTokenFactory: () => token })
      .withAutomaticReconnect().build();

    this.notifHub = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/notifications`, { accessTokenFactory: () => token })
      .withAutomaticReconnect().build();

    this.chatHub.on('ReceiveMessage', msg => this.messageSubject.next(msg));
    this.chatHub.on('UserTyping', userId => this.typingSubject.next(userId));
    this.notifHub.on('ReceiveNotification', n => this.notificationSubject.next(n));

    this.chatHub.start().catch(console.error);
    this.notifHub.start().catch(console.error);
  }

  joinConversation(conversationId: string): void { 
    this.chatHub.invoke('JoinConversation', conversationId); 
  }

  sendMessage(conversationId: string, message: string): void { 
    this.chatHub.invoke('SendMessage', conversationId, message); 
  }

  startTyping(conversationId: string): void { 
    this.chatHub.invoke('StartTyping', conversationId); 
  }

  stopTyping(conversationId: string): void { 
    this.chatHub.invoke('StopTyping', conversationId); 
  }
}
