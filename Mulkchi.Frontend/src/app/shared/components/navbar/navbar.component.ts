import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { NotificationBellComponent } from '../notifications/notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
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

  constructor() {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map((u) => !!u));
    this.currentUser$ = this.authService.currentUser$;
    this.isHost$ = this.authService.currentUser$.pipe(
      map((u) => (u ? u.role === 1 || u.role === 2 : false)),
    );
    this.isAdmin$ = this.authService.currentUser$.pipe(map((u) => (u ? u.role === 2 : false)));
  }

  ngOnInit(): void {
    this.statusInterval = setInterval(() => {
      this.isSignalRConnected = this.signalRService.getConnectionStatus();
    }, 1000);
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

    return 'U';
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
