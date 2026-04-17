import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { FavoriteService } from './core/services/favorite.service';
import { LanguageService } from './core/services/language.service';
import { LoggingService } from './core/services/logging.service';
import { NotificationService } from './core/services/notification.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ProgressBarComponent } from './shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ProgressBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Mulkchi';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private languageService: LanguageService,
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    // Initialize language
    this.languageService.init();

    // Recover session on page reload
    const savedUser = localStorage.getItem('user') ?? localStorage.getItem('auth_user');
    if (
      savedUser &&
      savedUser !== 'undefined' &&
      savedUser !== 'null' &&
      !this.authService.getToken()
    ) {
      this.authService.refreshToken().subscribe({
        next: () => this.subscribeToUser(), // Token restored, start services
        error: () => {
          // Token expired. We cleanly wipe state so nothing tries to load auth data
          this.logger.warn('Session expired. Cleaning up local state.');
          this.authService.clearAuth();
          this.subscribeToUser();
        },
      });
    } else {
      // Already clean guest state or already valid session
      this.subscribeToUser();
    }
  }

  private subscribeToUser(): void {
    // Start notification service and load favorites when user is confirmed fully logged in
    this.authService.currentUser$.subscribe((user) => {
      // Must have both user and active token to perform authenticated calls
      if (user && this.authService.getToken()) {
        this.notificationService.startConnection();
        this.favoriteService.loadUserFavorites();
      }
    });
  }
}
