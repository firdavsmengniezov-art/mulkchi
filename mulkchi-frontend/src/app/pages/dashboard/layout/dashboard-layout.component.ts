import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="dashboard-wrapper">
      <aside class="dashboard-sidebar">
        <a routerLink="/" class="sidebar-logo">
          <span>Mulkchi</span><span class="dot">.</span>
        </a>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard/overview" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span>Umumiy ko'rinish</span>
          </a>
          <a routerLink="/dashboard/my-properties" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏠</span>
            <span>Mulklarim</span>
          </a>
          <a routerLink="/dashboard/requests" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span>
            <span>So'rovlar</span>
          </a>
          <a routerLink="/dashboard/payments" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💳</span>
            <span>To'lovlar</span>
          </a>
          <a routerLink="/dashboard/settings" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span>Sozlamalar</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <span>🚪</span> Chiqish
          </button>
        </div>
      </aside>

      <main class="dashboard-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}
