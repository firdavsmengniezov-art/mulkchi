import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './core/services/auth.service';
import { FavoriteService } from './core/services/favorite.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Mulkchi';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Initialize language
    this.languageService.init();

    // Start notification service when user is logged in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.notificationService.startConnection();
        this.favoriteService.loadUserFavorites();
      }
    });
  }
}
