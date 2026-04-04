import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PricePredictionRequest, PricePredictionResponse, REGION_MAP } from '../../core/models';

@Component({
  selector: 'app-ai-price',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, DecimalPipe],
  templateUrl: './ai-price.component.html',
  styleUrls: ['./ai-price.component.scss']
})
export class AiPriceComponent {
  // Form fields
  area: number = 85;
  bedrooms: number = 3;
  bathrooms: number = 2;
  region: string = 'Toshkent';
  distance: number = 5;
  hasWifi: boolean = true;
  hasParking: boolean = true;
  hasPool: boolean = false;
  isRenovated: boolean = true;
  hasElevator: boolean = false;

  // State
  loading: boolean = false;
  result: PricePredictionResponse | null = null;
  errorMsg: string = '';

  regions = [
    'Toshkent', 'Samarqand', 'Buxoro', 'Namangan',
    'Andijon', 'Fargona', 'Qashqadaryo', 'Surxondaryo',
    'Xorazm', 'Navoiy', 'Jizzax', 'Sirdaryo',
    'Qoraqalpogiston', 'Toshkent viloyati'
  ];

  constructor(private analyticsService: AnalyticsService) {}

  predictPrice() {
    if (!this.area || !this.bedrooms) {
      this.errorMsg = 'Maydon va xonalar sonini kiriting';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.result = null;

    const request: PricePredictionRequest = {
      area: this.area,
      bedrooms: this.bedrooms,
      bathrooms: this.bathrooms,
      region: REGION_MAP[this.region] || 0, // Convert string region to number
      hasWifi: this.hasWifi,
      hasParking: this.hasParking,
      hasPool: this.hasPool,
      isRenovated: this.isRenovated,
      hasElevator: this.hasElevator,
      distanceToCityCenter: this.distance
    };

    this.analyticsService.predictPrice(request).subscribe({
      next: (res) => {
        this.loading = false;
        this.result = res;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Narx hisoblanmadi. Keyinroq urinib koring.';
        console.error(err);
      }
    });
  }

  getConfidenceColor(): string {
    if (!this.result) return '';
    const map: any = {
      'Low': '#e74c3c',
      'Medium': '#f39c12', 
      'High': '#2ecc71',
      'VeryHigh': '#27ae60'
    };
    return map[this.result.confidence] || '#6b7280';
  }

  getConfidenceText(): string {
    if (!this.result) return '';
    const map: any = {
      'Low': 'Past',
      'Medium': "O'rta",
      'High': 'Yuqori',
      'VeryHigh': 'Juda yuqori'
    };
    return map[this.result.confidence] || this.result.confidence;
  }

  getRangePercent(): number {
    if (!this.result) return 50;
    const { min, max } = this.result.priceRange;
    const predicted = this.result.predictedPrice;
    return Math.round(((predicted - min) / (max - min)) * 100);
  }
}
