import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PaymentStatus } from '../../../core/models/payment.models';

@Component({
  selector: 'app-payment-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <span class="payment-status-badge {{ getStatusClass(status) }}">
      <mat-icon>{{ getStatusIcon(status) }}</mat-icon>
      {{ getStatusText(status) }}
    </span>
  `,
  styles: [`
    .payment-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;

      &.completed {
        background: #e8f5e8;
        color: #2e7d32;
      }

      &.pending {
        background: #fff3e0;
        color: #f57c00;
      }

      &.processing {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.failed {
        background: #ffebee;
        color: #d32f2f;
      }

      &.refunded {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.cancelled {
        background: #f5f5f5;
        color: #9e9e9e;
      }

      mat-icon {
        font-size: 14px;
      }
    }
  `]
})
export class PaymentStatusBadgeComponent {
  @Input() status!: PaymentStatus;

  getStatusClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Completed:
        return 'completed';
      case PaymentStatus.Pending:
        return 'pending';
      case PaymentStatus.Processing:
        return 'processing';
      case PaymentStatus.Failed:
        return 'failed';
      case PaymentStatus.Refunded:
        return 'refunded';
      case PaymentStatus.Cancelled:
        return 'cancelled';
      default:
        return '';
    }
  }

  getStatusIcon(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Completed:
        return 'check_circle';
      case PaymentStatus.Pending:
        return 'pending';
      case PaymentStatus.Processing:
        return 'hourglass_top';
      case PaymentStatus.Failed:
        return 'error';
      case PaymentStatus.Refunded:
        return 'replay';
      case PaymentStatus.Cancelled:
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusText(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Completed:
        return 'To\'langan';
      case PaymentStatus.Pending:
        return 'Kutilmoqda';
      case PaymentStatus.Processing:
        return 'Jarayonda';
      case PaymentStatus.Failed:
        return 'Muvaffaqiyatsiz';
      case PaymentStatus.Refunded:
        return 'Qaytarilgan';
      case PaymentStatus.Cancelled:
        return 'Bekor qilingan';
      default:
        return status;
    }
  }
}
