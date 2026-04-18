import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <div class="error-code">404</div>
        <mat-icon class="error-icon">search_off</mat-icon>
        <h1>Sahifa topilmadi</h1>
        <p>So'ralgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.</p>
        <div class="actions">
          <button mat-raised-button color="primary" routerLink="/">
            <mat-icon>home</mat-icon>
            Bosh sahifaga qaytish
          </button>
          <button mat-stroked-button color="primary" routerLink="/properties">
            <mat-icon>apartment</mat-icon>
            Mulk qidirish
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .not-found-card {
      text-align: center;
      padding: 64px 48px;
      max-width: 500px;
    }

    .error-code {
      font-size: 8rem;
      font-weight: 700;
      color: #667eea;
      line-height: 1;
      margin-bottom: 16px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #999;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    }

    p {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 32px;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    @media (max-width: 480px) {
      .not-found-card {
        padding: 48px 24px;
      }

      .error-code {
        font-size: 6rem;
      }

      .actions {
        flex-direction: column;
      }

      .actions button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class NotFoundComponent {}
