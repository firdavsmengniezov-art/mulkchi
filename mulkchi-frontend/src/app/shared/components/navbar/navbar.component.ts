import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="nav-container">
        <a routerLink="/" class="nav-logo">
          <span class="logo-text">Mulkchi</span>
          <span class="logo-dot">.</span>
        </a>

        <ul class="nav-links">
          <li><a routerLink="/properties" routerLinkActive="active">Mulklar</a></li>
          <li><a routerLink="/properties" [queryParams]="{listingType: 'Rent'}" routerLinkActive="active">Ijaraga berish</a></li>
          <li><a routerLink="/properties" [queryParams]="{listingType: 'Sale'}" routerLinkActive="active">Narxlar</a></li>
        </ul>

        <div class="nav-actions">
          <ng-container *ngIf="!isLoggedIn; else loggedInTpl">
            <a routerLink="/login" class="btn-outline-gold">Kirish</a>
            <a routerLink="/register" class="btn-gold">Ro'yxatdan o'tish</a>
          </ng-container>

          <ng-template #loggedInTpl>
            <div class="user-menu" (click)="toggleDropdown()">
              <div class="avatar">{{ getUserInitial() }}</div>
              <span class="chevron">▾</span>

              <div class="dropdown" *ngIf="showDropdown">
                <a routerLink="/dashboard" class="dropdown-item" (click)="showDropdown = false">
                  📊 Dashboard
                </a>
                <div class="divider"></div>
                <button class="dropdown-item logout-btn" (click)="logout()">
                  🚪 Chiqish
                </button>
              </div>
            </div>
          </ng-template>
        </div>

        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div class="mobile-menu" *ngIf="showMobileMenu">
        <a routerLink="/properties" (click)="showMobileMenu = false">Mulklar</a>
        <a routerLink="/login" *ngIf="!isLoggedIn" (click)="showMobileMenu = false">Kirish</a>
        <a routerLink="/register" *ngIf="!isLoggedIn" (click)="showMobileMenu = false">Ro'yxatdan o'tish</a>
        <a routerLink="/dashboard" *ngIf="isLoggedIn" (click)="showMobileMenu = false">Dashboard</a>
        <button *ngIf="isLoggedIn" (click)="logout()">Chiqish</button>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private readonly authService = inject(AuthService);
  isLoggedIn = false;
  isScrolled = false;
  showDropdown = false;
  showMobileMenu = false;

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  getUserInitial(): string {
    return 'U';
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showDropdown = false;
  }
}
