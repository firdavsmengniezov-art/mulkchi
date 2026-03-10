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

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(map(u => !!u));
    this.currentUser$ = this.authService.currentUser$;
    this.isHost$ = this.authService.currentUser$.pipe(map(u => u ? (u.role === 1 || u.role === 2) : false));
    this.isAdmin$ = this.authService.currentUser$.pipe(map(u => u ? u.role === 2 : false));
  }

  logout() { 
    this.authService.logout(); 
    this.router.navigate(['/']); 
  }
}
