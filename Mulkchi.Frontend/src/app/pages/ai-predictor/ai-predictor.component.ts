import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AnalyticsService } from '../../core/services/analytics.service';
import { PricePredictionRequest, PricePredictionResponse, ConfidenceLevel } from '../../core/interfaces/analytics.interface';

@Component({
  selector: 'app-ai-predictor',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './ai-predictor.component.html',
  styleUrl: './ai-predictor.component.scss'
})
export class AiPredictorComponent {
  predictionForm: FormGroup;
  loading = false;
  predictionResult: PricePredictionResponse | null = null;

  regions = [
    { value: 0, name: 'Toshkent' },
    { value: 1, name: 'Samarqand' },
    { value: 2, name: 'Buxoro' },
    { value: 3, name: 'Farg\'ona' },
    { value: 4, name: 'Andijon' },
    { value: 5, name: 'Namangan' },
    { value: 6, name: 'Qashqadaryo' },
    { value: 7, name: 'Surxondaryo' },
    { value: 8, name: 'Jizzax' },
    { value: 9, name: 'Sirdaryo' },
    { value: 10, name: 'Xorazm' },
    { value: 11, name: 'Qoraqalpog\'iston' },
    { value: 12, name: 'Toshkent viloyati' },
    { value: 13, name: 'Navoiy' }
  ];

  constructor(
    private fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private snackBar: MatSnackBar
  ) {
    this.predictionForm = this.fb.group({
      area: [null, [Validators.required, Validators.min(10)]],
      bedrooms: [null, [Validators.required, Validators.min(1)]],
      bathrooms: [null, [Validators.required, Validators.min(1)]],
      region: [null, Validators.required],
      hasWifi: [false],
      hasParking: [false],
      hasPool: [false],
      isRenovated: [false],
      hasElevator: [false],
      distanceToCityCenter: [null, [Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.predictionForm.invalid) {
      this.predictionForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.predictionResult = null;

    const request: PricePredictionRequest = this.predictionForm.value;

    this.analyticsService.predictPrice(request).subscribe({
      next: (response: PricePredictionResponse) => {
        this.predictionResult = response;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = error.error?.message || 'Narxni bashorat qilishda xatolik yuz berdi';
        this.snackBar.open(errorMessage, 'OK', { duration: 5000 });
      }
    });
  }

  getConfidenceText(level: ConfidenceLevel): string {
    const levels = {
      [ConfidenceLevel.Low]: 'Past',
      [ConfidenceLevel.Medium]: 'O\'rta',
      [ConfidenceLevel.High]: 'Yuqori',
      [ConfidenceLevel.VeryHigh]: 'Juda yuqori'
    };
    return levels[level];
  }

  getConfidenceColor(level: ConfidenceLevel): string {
    const colors = {
      [ConfidenceLevel.Low]: '#f44336',
      [ConfidenceLevel.Medium]: '#ff9800',
      [ConfidenceLevel.High]: '#4caf50',
      [ConfidenceLevel.VeryHigh]: '#2196f3'
    };
    return colors[level];
  }

  formatPrice(price: number): string {
    return price.toLocaleString('uz-UZ');
  }

  resetForm(): void {
    this.predictionForm.reset();
    this.predictionResult = null;
  }

  get area() {
    return this.predictionForm.get('area');
  }

  get bedrooms() {
    return this.predictionForm.get('bedrooms');
  }

  get bathrooms() {
    return this.predictionForm.get('bathrooms');
  }

  get region() {
    return this.predictionForm.get('region');
  }

  get distanceToCityCenter() {
    return this.predictionForm.get('distanceToCityCenter');
  }
}
