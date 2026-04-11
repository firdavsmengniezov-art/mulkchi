import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-host-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="detail-section host-section">
      <div class="host-header">
        <img [src]="getAvatarSrc(host?.avatarUrl)" class="host-avatar" alt="Host" />
        <div class="host-info">
          <h3>Xost: {{ host?.fullName || 'Mulk egasi' }}</h3>
          <p>{{ host?.memberSince | date: 'MMMM yyyy' }} dan beri a'zo</p>
        </div>
      </div>

      <div class="host-stats" *ngIf="host">
        <div class="stat">
          <span class="val">{{ host.totalReviews }}</span> sharhlar
        </div>
        <div class="stat">
          <span class="val">{{ host.averageRating }}★</span> reyting
        </div>
        <div class="stat">
          <span class="val">{{ host.responseRate || '100%' }}</span> javob berish darajasi
        </div>
      </div>

      <p class="host-desc">
        Xost bilan gaplashib mulk haqida to'liqroq ma'lumot olishingiz mumkin.
      </p>

      <button class="btn-outline">Xostga yozish</button>

      <div class="safety-tip">
        <span class="icon">🔒</span> Mulkchi tizimidan tashqarida to'lov qilmang.
      </div>
    </section>
  `,
  styles: [
    `
      .detail-section {
        padding: 32px 0;
        border-bottom: 1px solid var(--color-border, #eaeaea);
      }
      .host-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      }
      .host-avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
      }
      h3 {
        font-size: 20px;
        margin: 0 0 4px;
      }
      .host-info p {
        color: #717171;
        margin: 0;
        font-size: 14px;
      }

      .host-stats {
        display: flex;
        gap: 24px;
        margin-bottom: 24px;
        .stat {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: #717171;
        }
        .val {
          font-size: 18px;
          font-weight: 600;
          color: #222;
          margin-bottom: 4px;
        }
      }

      .host-desc {
        font-size: 15px;
        line-height: 1.5;
        margin-bottom: 24px;
        max-width: 400px;
      }

      .btn-outline {
        padding: 12px 24px;
        background: transparent;
        border: 1px solid #222;
        border-radius: 8px;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        margin-bottom: 32px;
        &:hover {
          background: #f7f7f7;
        }
      }

      .safety-tip {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: #717171;
        .icon {
          font-size: 20px;
        }
      }
    `,
  ],
})
export class HostCardComponent {
  @Input() host: any;
  readonly backendOrigin = environment.hubUrl;

  getAvatarSrc(avatarUrl?: string | null): string {
    return avatarUrl ? `${this.backendOrigin}${avatarUrl}` : '/assets/images/user-placeholder.png';
  }
}
