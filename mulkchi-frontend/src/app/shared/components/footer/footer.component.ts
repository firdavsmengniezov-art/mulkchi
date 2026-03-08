import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <a routerLink="/" class="footer-logo">
            <span>Mulkchi</span><span class="dot">.</span>
          </a>
          <p class="footer-desc">
            O'zbekiston №1 ko'chmas mulk ijara va sotish platformasi
          </p>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>Platforma</h4>
            <a routerLink="/properties">Mulklar</a>
            <a routerLink="/properties" [queryParams]="{listingType: 'Rent'}">Ijaraga olish</a>
            <a routerLink="/properties" [queryParams]="{listingType: 'Sale'}">Sotib olish</a>
          </div>

          <div class="link-group">
            <h4>Kompaniya</h4>
            <a href="#">Biz haqimizda</a>
            <a href="#">Blog</a>
            <a href="#">Aloqa</a>
          </div>

          <div class="link-group">
            <h4>Huquqiy</h4>
            <a href="#">Foydalanish shartlari</a>
            <a href="#">Maxfiylik siyosati</a>
            <a href="#">Cookie</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ currentYear }} Mulkchi. Barcha huquqlar himoyalangan.</p>
        <div class="social-links">
          <a href="#" aria-label="Telegram">📱 Telegram</a>
          <a href="#" aria-label="Instagram">📸 Instagram</a>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
