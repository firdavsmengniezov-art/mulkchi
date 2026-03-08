import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Payment, PaymentStatus } from '../../../core/models/payment.models';
import { LanguageService } from '../../../core/services/language.service';
import { PaymentService } from '../../../core/services/payment.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="payments-page">
      <h1>{{ 'payments.title' | translate }}</h1>

      <div class="table-wrapper">
        <table class="data-table" *ngIf="payments.length > 0">
          <thead>
            <tr>
              <th>{{ 'payments.col_date' | translate }}</th>
              <th>{{ 'payments.col_amount' | translate }}</th>
              <th>{{ 'payments.col_status' | translate }}</th>
              <th>{{ 'payments.col_method' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let payment of payments">
              <td>{{ payment.createdDate | date: 'dd.MM.yyyy HH:mm' }}</td>
              <td>{{ payment.amount | number }} UZS</td>
              <td>
                <span
                  class="status-badge"
                  [ngClass]="'status-' + payment.status"
                >
                  {{ getStatusLabel(payment.status) }}
                </span>
              </td>
              <td>{{ payment.method }}</td>
            </tr>
          </tbody>
        </table>
        <p class="empty-state" *ngIf="payments.length === 0">
          {{ 'payments.empty' | translate }}
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly langService = inject(LanguageService);
  payments: Payment[] = [];

  ngOnInit(): void {
    this.paymentService.getAll().subscribe({
      next: (result) => (this.payments = result.items),
      error: () => {},
    });
  }

  getStatusLabel(status: PaymentStatus): string {
    const labels: Record<number, string> = {
      [PaymentStatus.Pending]: 'Kutilmoqda',
      [PaymentStatus.Processing]: 'Jarayonda',
      [PaymentStatus.Completed]: 'Yakunlangan',
      [PaymentStatus.Failed]: 'Xatolik',
      [PaymentStatus.Refunded]: 'Qaytarilgan',
      [PaymentStatus.Cancelled]: 'Bekor qilingan',
    };
    return labels[status] ?? String(status);
  }
}
