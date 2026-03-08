import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, TranslatePipe],
  template: `
    <div class="dashboard-wrapper">
      <aside class="dashboard-sidebar">
        <a routerLink="/" class="sidebar-logo">
          <span>Mulkchi</span><span class="dot">.</span>
        </a>

        <nav class="sidebar-nav">
          <a
            routerLink="/dashboard/overview"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="nav-icon">📊</span>
            <span>{{ 'nav.overview' | translate }}</span>
          </a>
          <a
            routerLink="/dashboard/my-properties"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="nav-icon">🏠</span>
            <span>{{ 'nav.properties' | translate }}</span>
          </a>
          <a
            routerLink="/dashboard/requests"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="nav-icon">📋</span>
            <span>{{ 'nav.requests' | translate }}</span>
          </a>
          <a
            routerLink="/dashboard/payments"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="nav-icon">💳</span>
            <span>{{ 'nav.payments' | translate }}</span>
          </a>
          <a
            routerLink="/dashboard/settings"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="nav-icon">⚙️</span>
            <span>{{ 'nav.settings' | translate }}</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="lang-switcher">
            <button
              class="lang-btn"
              [class.active]="(langService.currentLang$ | async) === 'uz'"
              (click)="setLang('uz')"
            >
              UZ
            </button>
            <button
              class="lang-btn"
              [class.active]="(langService.currentLang$ | async) === 'ru'"
              (click)="setLang('ru')"
            >
              RU
            </button>
            <button
              class="lang-btn"
              [class.active]="(langService.currentLang$ | async) === 'en'"
              (click)="setLang('en')"
            >
              EN
            </button>
          </div>
          <button class="logout-btn" (click)="logout()">
            <span>🚪</span> {{ 'nav.logout' | translate }}
          </button>
        </div>
      </aside>

      <main class="dashboard-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  protected readonly langService = inject(LanguageService);
  private readonly router = inject(Router);

  setLang(lang: string): void {
    this.langService.setLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
  }
}
