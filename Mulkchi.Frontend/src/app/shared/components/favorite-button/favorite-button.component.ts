import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, finalize } from 'rxjs';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <button mat-icon-button
      [class.favorited]="isFavorited"
      (click)="onToggle($event)"
      [disabled]="isLoading"
      [matTooltip]="isFavorited ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\\'shish'">
      @if (isLoading) {
        <mat-spinner diameter="20"></mat-spinner>
      } @else {
        <mat-icon>{{ isFavorited ? 'favorite' : 'favorite_border' }}</mat-icon>
      }
    </button>
  `,
  styles: [`
    button {
      transition: all 0.2s;
    }
    
    button.favorited mat-icon { 
      color: #e53935; 
      animation: heartBeat 0.3s ease-in-out;
    }
    
    button:not(.favorited) mat-icon { 
      color: rgba(255,255,255,0.9); 
    }
    
    button:hover {
      transform: scale(1.1);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }
    
    button:disabled {
      opacity: 0.6;
    }
    
    @keyframes heartBeat {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `]
})
export class FavoriteButtonComponent implements OnInit {
  @Input() propertyId!: string;
  @Output() toggled = new EventEmitter<any>();

  isFavorited = false;
  isLoading = false;

  constructor(
    private favoritesService: FavoriteService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.favoritesService.isFavorited(this.propertyId)
      .subscribe(isFavorited => {
        this.isFavorited = isFavorited;
      });
  }

  onToggle(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Sevimlilarga qo\'shish uchun tizimga kiring', 'Kirish', { 
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
        .onAction()
        .subscribe(() => this.router.navigate(['/login']));
      return;
    }

    this.isLoading = true;
    this.favoritesService.toggleFavorite(this.propertyId)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (result) => {
          this.isFavorited = result.isFavorited;
          this.toggled.emit(result);
          const message = result.isFavorited ? 'Sevimlilarga qo\'shildi' : 'Sevimlilardan olib tashlandi';
          this.snackBar.open(message, '✓', { 
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        },
        error: () => {
          this.snackBar.open('Xatolik yuz berdi', '✗', { 
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
  }
}
