import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import {
  PagedResult,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../../../core/models/payment.models';
import { LoggingService } from '../../../core/services/logging.service';
import { PaymentService } from '../../../core/services/payment.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

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
    MatTooltipModule,
    RouterModule,
    NavbarComponent,
  ],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'],
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
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;

    this.paymentService
      .getMyPayments({
        page: this.currentPage,
        pageSize: this.pageSize,
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
        },
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.loadPayments();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
  }

  onMethodChange(method: string): void {
    this.selectedMethod = method;
    this.currentPage = 1;
  }

  viewPaymentDetails(payment: Payment): void {
    this.router.navigate(['/payments', payment.id]);
  }

  cancelPayment(payment: Payment, event: Event): void {
    event.stopPropagation();

    this.paymentService
      .cancelPayment(payment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update local payment status
          payment.status = PaymentStatus.Cancelled;
        },
        error: (err) => {
          this.logger.error('Failed to cancel payment:', err);
        },
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
      { value: PaymentStatus.Completed, label: "To'langan" },
      { value: PaymentStatus.Failed, label: 'Muvaffaqiyatsiz' },
      { value: PaymentStatus.Refunded, label: 'Qaytarilgan' },
      { value: PaymentStatus.Cancelled, label: 'Bekor qilingan' },
    ];
  }

  getMethodOptions(): { value: string; label: string }[] {
    return [
      { value: 'all', label: 'Barchasi' },
      { value: PaymentMethod.Card, label: 'Plastik karta' },
      { value: PaymentMethod.Cash, label: 'Naqd pul' },
      { value: PaymentMethod.BankTransfer, label: "Bank o'tkazmas" },
      { value: PaymentMethod.Payme, label: 'Payme' },
      { value: PaymentMethod.Click, label: 'Click' },
      { value: PaymentMethod.Uzum, label: 'Uzum' },
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Helper methods for template
  getTotalPaid(): number {
    return this.filteredPayments
      .filter((p) => p.status === PaymentStatus.Completed)
      .reduce((sum, p) => sum + (p.hostReceives || p.amount || 0), 0);
  }

  getTotalReceived(): number {
    return this.filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  getPendingAmount(): number {
    return this.filteredPayments
      .filter((p) => p.status === PaymentStatus.Pending)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  get filteredPayments(): Payment[] {
    return this.payments.filter((payment) => {
      if (this.selectedStatus !== 'all' && payment.status !== this.selectedStatus) {
        return false;
      }

      if (this.selectedMethod !== 'all' && payment.method !== this.selectedMethod) {
        return false;
      }

      return true;
    });
  }
}
