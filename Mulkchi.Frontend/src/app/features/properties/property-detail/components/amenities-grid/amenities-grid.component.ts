import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-amenities-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="detail-section">
      <h2>Qulayliklar</h2>
      <div class="amenities-grid">
        <div class="amenity-item" *ngIf="property.hasWifi">📶 WiFi</div>
        <div class="amenity-item" *ngIf="property.hasParking">🚗 Avtoturargoh</div>
        <div class="amenity-item" *ngIf="property.hasPool">🏊 Hovuz</div>
        <div class="amenity-item" *ngIf="property.petsAllowed">🐾 Uy hayvonlari</div>
        <div class="amenity-item" *ngIf="property.isInstantBook">⚡ Tez bron</div>
        <div class="amenity-item" *ngIf="property.hasAirConditioning">❄️ Konditsioner</div>
        <div class="amenity-item" *ngIf="property.hasHeating">🔥 Isitish</div>
        <div class="amenity-item" *ngIf="property.hasWasher">🧺 Kir yuvish mashinasi</div>
        <div class="amenity-item" *ngIf="property.hasKitchen">🍳 Oshxona</div>
        <div class="amenity-item" *ngIf="property.hasTV">📺 Televizor</div>
        <div class="amenity-item" *ngIf="property.hasWorkspace">💼 Ish joyi</div>
        <div class="amenity-item" *ngIf="property.isSelfCheckIn">🏠 O'z-o'ziga kirish</div>
        <div class="amenity-item" *ngIf="property.hasElevator">🛗 Lift</div>
      </div>
      <button class="btn-outline">Barcha qulayliklarni ko'rsatish</button>
    </section>
  `,
  styles: [
    `
      .detail-section {
        padding: 32px 0;
        border-bottom: 1px solid var(--color-border, #eaeaea);
      }
      h2 {
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 24px;
      }
      .amenities-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }
      .amenity-item {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 16px;
        color: #222;
      }
      .btn-outline {
        padding: 12px 24px;
        background: transparent;
        border: 1px solid #222;
        border-radius: 8px;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
        &:hover {
          background: #f7f7f7;
        }
      }
    `,
  ],
})
export class AmenitiesGridComponent {
  @Input() property: any;
}
