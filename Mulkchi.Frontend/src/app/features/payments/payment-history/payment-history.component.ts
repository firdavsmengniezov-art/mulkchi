import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentService } from '../../../core/services/payment.service';
import { LoggingService } from '../../../core/services/logging.service';
import { 
  Payment, 
  PaymentStatus, 
  PaymentMethod,
  PagedResult 
} from '../../../core/models/payment.models';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit, OnDestroy {
  payments: Payment[] = [];
  pagedResult: PagedResult<Payment> | null = null;
  loading = true;
  currentPage = 1;
  pageSize = 10;
  selectedStatus: string = 'all';
  selectedMethod: string = 'all';
  selectedTab = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    
    this.paymentService.getMyPayments({
      page: this.currentPage,
      pageSize: this.pageSize
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.pagedResult = result;
          this.payments = result.items;
          this.loading = false;
        },
        error: (err) => {
          this.logger.error('Failed to load payments:', err);
          this.loading = false;
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.loadPayments();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadPayments();
  }

  onMethodChange(method: string): void {
    this.selectedMethod = method;
    this.currentPage = 1;
    this.loadPayments();
  }

  viewPaymentDetails(payment: Payment): void {
    this.router.navigate(['/payments', payment.id]);
  }

  cancelPayment(payment: Payment, event: Event): void {
    event.stopPropagation();
    
    this.paymentService.cancelPayment(payment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local payment status
          payment.status = PaymentStatus.Cancelled;
        },
        error: (err) => {
          this.logger.error('Failed to cancel payment:', err);
        }
      });
  }

  getStatusColor(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Completed:
        return 'success';
      case PaymentStatus.Pending:
        return 'warning';
      case PaymentStatus.Failed:
        return 'error';
      case PaymentStatus.Refunded:
        return 'info';
      case PaymentStatus.Cancelled:
        return 'muted';
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
    return this.paymentService.getPaymentStatusText(status);
  }

  getMethodIcon(method: PaymentMethod): string {
    return this.paymentService.getPaymentMethodIcon(method);
  }

  getMethodText(method: PaymentMethod): string {
    return this.paymentService.getPaymentMethodText(method);
  }

  getStatusOptions(): { value: string; label: string }[] {
    return [
      { value: 'all', label: 'Barchasi' },
      { value: PaymentStatus.Pending, label: 'Kutilmoqda' },
      { value: PaymentStatus.Processing, label: 'Jarayonda' },
      { value: PaymentStatus.Completed, label: 'To\'langan' },
      { value: PaymentStatus.Failed, label: 'Muvaffaqiyatsiz' },
      { value: PaymentStatus.Refunded, label: 'Qaytarilgan' },
      { value: PaymentStatus.Cancelled, label: 'Bekor qilingan' }
    ];
  }

  getMethodOptions(): { value: string; label: string }[] {
    return [
      { value: 'all', label: 'Barchasi' },
      { value: PaymentMethod.Card, label: 'Plastik karta' },
      { value: PaymentMethod.Cash, label: 'Naqd pul' },
      { value: PaymentMethod.BankTransfer, label: 'Bank o\'tkazmas' },
      { value: PaymentMethod.Payme, label: 'Payme' },
      { value: PaymentMethod.Click, label: 'Click' },
      { value: PaymentMethod.Uzum, label: 'Uzum' }
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helper methods for template
  getTotalPaid(): number {
    if (!this.pagedResult?.items) return 0;
    return this.pagedResult.items
      .filter(p => p.status === PaymentStatus.Completed)
      .reduce((sum, p) => sum + (p.hostReceives || p.amount || 0), 0);
  }

  getTotalReceived(): number {
    if (!this.pagedResult?.items) return 0;
    return this.pagedResult.items
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  getPendingAmount(): number {
    if (!this.pagedResult?.items) return 0;
    return this.pagedResult.items
      .filter(p => p.status === PaymentStatus.Pending)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }
}
