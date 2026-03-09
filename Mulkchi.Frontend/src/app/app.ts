import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from './core/services/auth.service';
import { SignalrService } from './core/services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  title = 'Mulkchi - O\'zbekiston ko\'chmas mulk platformasi';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private signalrService: SignalrService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialize SignalR if user is logged in
    if (this.authService.isLoggedIn) {
      this.initializeSignalR();
    }

    // Subscribe to auth state changes
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.initializeSignalR();
        } else {
          this.signalrService.disconnect();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.signalrService.disconnect();
  }

  private async initializeSignalR(): Promise<void> {
    try {
      await this.signalrService.initializeChatHub();
      await this.signalrService.initializeNotificationHub();
    } catch (error) {
      console.error('Error initializing SignalR:', error);
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get isHost(): boolean {
    return this.authService.isHost;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
    this.snackBar.open('Siz tizimdan chiqdingiz', 'OK', { duration: 3000 });
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToHostDashboard(): void {
    this.router.navigate(['/host-dashboard']);
  }

  navigateToAdminPanel(): void {
    this.router.navigate(['/admin-panel']);
  }
}
