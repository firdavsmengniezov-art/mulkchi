import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { LanguageService } from '../../../core/services/language.service';
import { Observable, map } from 'rxjs';
import { NotificationBellComponent } from '../notifications/notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<any>;
  isHost$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isSignalRConnected = false;
  
  // Language switcher
  get languages() { return this.languageService.languages; }
  showLangMenu = false;
  showUserMenu = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private signalRService = inject(SignalRService);
  private languageService = inject(LanguageService);

  constructor() {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map(u => !!u));
    this.currentUser$ = this.authService.currentUser$;
    this.isHost$ = this.authService.currentUser$.pipe(map(u => u ? (u.role === 1 || u.role === 2) : false));
    this.isAdmin$ = this.authService.currentUser$.pipe(map(u => u ? u.role === 2 : false));
  }

  ngOnInit(): void {
    // Update SignalR connection status
    setInterval(() => {
      this.isSignalRConnected = this.signalRService.getConnectionStatus();
    }, 1000);
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  get currentLang() {
    return this.languageService.getCurrentLangObj();
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }

  toggleLangMenu() {
    this.showLangMenu = !this.showLangMenu;
  }

  changeLang(code: string) {
    this.languageService.setLanguage(code);
    this.showLangMenu = false;
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
}
