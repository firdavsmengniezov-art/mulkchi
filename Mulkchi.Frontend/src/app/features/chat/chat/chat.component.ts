import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ChatService, Message, Conversation } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  conversations: Conversation[] = [];
  messages: Message[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  isTyping = false;
  currentUserId = '';
  connectionStatus = false;
  loading = true;
  unreadCount = 0;

  private destroy$ = new Subject<void>();
  private typingTimeout: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUser$.value?.id || '';
    
    // Setup subscriptions
    this.setupSubscriptions();
    
    // Start SignalR connection
    this.chatService.startConnection();
    
    // Load conversations
    this.chatService.loadConversations();
    
    // Check for userId in route params
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const userId = params.get('userId');
      if (userId) {
        this.selectConversationById(userId);
      }
    });
  }

  private setupSubscriptions(): void {
    // Connection status
    this.chatService.getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.connectionStatus = status;
        if (status) {
          this.loading = false;
        }
      });

    // Conversations
    this.chatService.getConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(conversations => {
        this.conversations = conversations;
        this.unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      });

    // Messages
    this.chatService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.scrollToBottom();
      });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.chatService.setCurrentConversation(conversation.otherUserId);
    this.chatService.loadConversationMessages(conversation.otherUserId);
    
    // Mark messages as read
    this.messages.forEach(msg => {
      if (!msg.isRead && msg.senderId === conversation.otherUserId) {
        this.chatService.markAsRead(msg.id);
      }
    });
    
    // Update unread count
    conversation.unreadCount = 0;
    this.updateTotalUnreadCount();
  }

  selectConversationById(userId: string): void {
    const conversation = this.conversations.find(conv => conv.otherUserId === userId);
    if (conversation) {
      this.selectConversation(conversation);
    } else {
      // Create new conversation (for property owner contact)
      this.createNewConversation(userId);
    }
  }

  private createNewConversation(userId: string): void {
    const newConv: Conversation = {
      otherUserId: userId,
      otherUserName: 'User',
      lastMessage: '',
      lastMessageDate: new Date().toISOString(),
      unreadCount: 0
    };
    
    this.conversations.unshift(newConv);
    this.selectConversation(newConv);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) {
      return;
    }

    const receiverId = this.selectedConversation.otherUserId;
    
    this.chatService.sendMessage(receiverId, this.newMessage.trim())
      .then(() => {
        this.newMessage = '';
        this.stopTyping();
      })
      .catch(err => {
        console.error('Failed to send message:', err);
      });
  }

  onTyping(): void {
    if (!this.isTyping && this.selectedConversation) {
      this.isTyping = true;
      this.chatService.sendTypingIndicator(this.selectedConversation.otherUserId, true);
    }

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 1000);
  }

  private stopTyping(): void {
    if (this.isTyping && this.selectedConversation) {
      this.isTyping = false;
      this.chatService.sendTypingIndicator(this.selectedConversation.otherUserId, false);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatMessageDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'hozir';
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} soat oldin`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)} kun oldin`;
    
    return date.toLocaleDateString('uz-UZ');
  }

  isOwnMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private updateTotalUnreadCount(): void {
    this.unreadCount = this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.typingTimeout);
  }
}
