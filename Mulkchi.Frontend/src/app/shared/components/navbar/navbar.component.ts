import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<any>;
  isHost$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  
  // Language switcher
  languages = [
    { code: 'uz', label: "O'z" },
    { code: 'ru', label: 'Ру' },
    { code: 'en', label: 'En' }
  ];
  currentLang = 'uz';
  showLangMenu = false;
  showUserMenu = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map(u => !!u));
    this.currentUser$ = this.authService.currentUser$;
    this.isHost$ = this.authService.currentUser$.pipe(map(u => u ? (u.role === 1 || u.role === 2) : false));
    this.isAdmin$ = this.authService.currentUser$.pipe(map(u => u ? u.role === 2 : false));
    
    // Load saved language
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.currentLang = savedLang;
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }

  switchLang(code: string) {
    this.currentLang = code;
    this.showLangMenu = false;
    localStorage.setItem('lang', code);
    // Store preference only - no i18n library needed for now
  }
}
