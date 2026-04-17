import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ChatAgent } from '../../../core/services/chat-agent.service';
import { LanguageService } from '../../../core/services/language.service';
import { NotificationAgent } from '../../../core/services/notification-agent.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationBellComponent } from '../notifications/notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NotificationBellComponent, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<any>;
  isHost$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isSignalRConnected = false;
  isMobileMenuOpen = false;
  isScrolled = false;

  // Language switcher
  get languages() {
    return this.languageService.languages;
  }
  showLangMenu = false;
  showUserMenu = false;
  private statusInterval: ReturnType<typeof setInterval> | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);
  private signalRService = inject(SignalRService);
  private languageService = inject(LanguageService);
  private themeService = inject(ThemeService);

  // Signal-based agents for real-time updates
  private notificationAgent = inject(NotificationAgent);
  private chatAgent = inject(ChatAgent);

  constructor() {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map((u) => !!u));
    this.currentUser$ = this.authService.currentUser$;
    this.isHost$ = this.authService.currentUser$.pipe(
      map((u) => {
        const role = u?.role as unknown;
        return !!u && (role === 1 || role === 2 || role === 'Host' || role === 'Admin');
      }),
    );
    this.isAdmin$ = this.authService.currentUser$.pipe(
      map((u) => {
        const role = u?.role as unknown;
        return !!u && (role === 2 || role === 'Admin');
      }),
    );
  }

  ngOnInit(): void {
    this.statusInterval = setInterval(() => {
      this.isSignalRConnected = this.signalRService.getConnectionStatus();
    }, 1000);

    // Start SignalR connections for real-time updates
    this.startSignalRConnections();
  }

  // ============ SIGNALR CONNECTION ============

  private async startSignalRConnections(): Promise<void> {
    if (this.authService.isAuthenticated()) {
      await this.notificationAgent.startConnection();
      await this.chatAgent.startConnection();
    }
  }

  // ============ REAL-TIME BADGE SIGNALS ============

  /** Real-time notification unread count from SignalR */
  get unreadNotificationCount(): number {
    return this.notificationAgent.unreadCount();
  }

  /** Real-time chat unread count from SignalR */
  get unreadChatCount(): number {
    return this.chatAgent.totalUnreadCount();
  }

  /** Combined unread count for badge */
  get totalUnreadCount(): number {
    return this.unreadNotificationCount + this.unreadChatCount;
  }

  /** Whether to show the badge */
  get hasUnreadNotifications(): boolean {
    return this.notificationAgent.hasUnreadNotifications();
  }

  get hasUnreadMessages(): boolean {
    return this.chatAgent.hasUnreadMessages();
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  get userInitial(): string {
    const firstName = this.currentUser?.firstName as string | undefined;
    const email = this.currentUser?.email as string | undefined;
    if (firstName && firstName.length > 0) {
      return firstName.charAt(0).toUpperCase();
    }

    if (email && email.length > 0) {
      return email.charAt(0).toUpperCase();
    }
    return '?';
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  toggleDarkMode(): void {
    this.themeService.toggle();
  }

  get currentLang() {
    return this.languageService.getCurrentLangObj();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.showUserMenu = false;
        this.isMobileMenuOpen = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.showUserMenu = false;
        this.isMobileMenuOpen = false;
        this.router.navigate(['/']);
      },
    });
  }

  toggleLangMenu() {
    this.showLangMenu = !this.showLangMenu;
    this.showUserMenu = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showLangMenu = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  changeLang(code: string) {
    this.languageService.setLanguage(code);
    this.showLangMenu = false;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.lang-switcher')) {
      this.showLangMenu = false;
    }
    if (!target.closest('.user-menu')) {
      this.showUserMenu = false;
    }
  }

  ngOnDestroy(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }
}
