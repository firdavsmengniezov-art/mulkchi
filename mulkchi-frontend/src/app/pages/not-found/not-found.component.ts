import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>Sahifa topilmadi</h1>
        <p>Kechirasiz, siz izlayotgan sahifa mavjud emas yoki ko'chirilgan.</p>
        <a routerLink="/" class="btn-gold home-btn">Bosh sahifaga qaytish</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
    }

    .not-found-content {
      max-width: 480px;
    }

    .error-code {
      font-family: 'Playfair Display', serif;
      font-size: 120px;
      font-weight: 700;
      line-height: 1;
      color: var(--gold);
      opacity: 0.3;
      margin-bottom: 16px;
    }

    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 36px;
    }

    .home-btn {
      text-decoration: none;
      display: inline-block;
    }
  `]
})
export class NotFoundComponent {}
