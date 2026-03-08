import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.models';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payments-page">
      <h1>To'lovlar</h1>

      <div class="table-wrapper">
        <table class="data-table" *ngIf="payments.length > 0">
          <thead>
            <tr>
              <th>Sana</th>
              <th>Summa</th>
              <th>Holat</th>
              <th>To'lov usuli</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let payment of payments">
              <td>{{ payment.createdDate | date:'dd.MM.yyyy HH:mm' }}</td>
              <td>{{ payment.amount | number }} UZS</td>
              <td>
                <span class="status-badge" [ngClass]="'status-' + payment.status.toLowerCase()">
                  {{ getStatusLabel(payment.status) }}
                </span>
              </td>
              <td>{{ payment.paymentMethod }}</td>
            </tr>
          </tbody>
        </table>
        <p class="empty-state" *ngIf="payments.length === 0">To'lovlar mavjud emas</p>
      </div>
    </div>
  `,
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  payments: Payment[] = [];

  ngOnInit(): void {
    this.paymentService.getAll().subscribe({
      next: (result) => this.payments = result.items,
      error: () => {}
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'Kutilmoqda',
      Completed: 'Yakunlangan',
      Failed: 'Xatolik',
      Refunded: 'Qaytarilgan'
    };
    return labels[status] ?? status;
  }
}
