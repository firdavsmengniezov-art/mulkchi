import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';
import {
  AnalyticsPeriod,
  BookingAnalytics,
  DashboardAnalytics,
  OverviewMetrics,
  PropertyAnalytics,
  RecommendationAnalytics,
  RevenueAnalytics,
  UserAnalytics,
  ViewAnalytics,
} from '../../../../core/models/dashboard-analytics.model';
import { DashboardAnalyticsService } from '../../../../core/services/dashboard-analytics.service';
import { LoggingService } from '../../../../core/services/logging.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  analytics: DashboardAnalytics | null = null;
  loading = false;
  error = '';
  selectedPeriod: AnalyticsPeriod = AnalyticsPeriod.Month;
  AnalyticsPeriod = AnalyticsPeriod;
  Math = Math;

  // Chart data
  revenueChartData: any = null;
  userGrowthChartData: any = null;
  bookingChartData: any = null;
  regionChartData: any = null;

  // Top items
  topViewedProperties: any[] = [];
  topBookedProperties: any[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private analyticsService: DashboardAnalyticsService,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = '';

    const subscription = this.analyticsService
      .getDashboardAnalytics({
        startDate: this.getPeriodRange(),
        endDate: new Date().toISOString().split('T')[0],
      })
      .subscribe({
        next: (data) => {
          this.analytics = data;
          this.prepareChartData();
          this.extractTopItems();
          this.loading = false;
        },
        error: (err) => {
          this.error = "Analitik ma'lumotlarni yuklashda xatolik";
          this.logger.error('Error loading analytics:', err);
          this.loading = false;
        },
      });

    this.subscriptions.push(subscription);
  }

  onPeriodChange(period: AnalyticsPeriod): void {
    this.selectedPeriod = period;
    this.loadAnalytics();
  }

  refreshData(): void {
    this.loadAnalytics();
  }

  private prepareChartData(): void {
    if (!this.analytics) return;

    // Revenue chart
    this.revenueChartData = this.analyticsService.prepareRevenueChart(
      this.analytics.revenue.monthlyRevenue,
    );

    // User growth chart
    this.userGrowthChartData = this.analyticsService.prepareUserGrowthChart(
      this.analytics.users.userGrowth,
    );

    // Booking chart
    this.bookingChartData = this.analyticsService.prepareBookingChart(
      this.analytics.bookings.bookingTrends,
    );

    // Region chart
    this.regionChartData = this.analyticsService.prepareRegionChart(
      this.analytics.bookings.bookingByRegion,
    );
  }

  private extractTopItems(): void {
    if (!this.analytics) return;

    this.topViewedProperties = this.analytics.properties.topViewedProperties.slice(0, 5);
    this.topBookedProperties = this.analytics.properties.topBookedProperties.slice(0, 5);
  }

  // Helper methods for display
  formatCurrency(amount: number): string {
    return this.analyticsService.formatCurrency(amount);
  }

  formatPercentage(value: number): string {
    return this.analyticsService.formatPercentage(value);
  }

  formatGrowth(value: number): string {
    return this.analyticsService.formatGrowth(value);
  }

  getGrowthColor(value: number): string {
    return this.analyticsService.getGrowthColor(value);
  }

  getGrowthIcon(value: number): string {
    return this.analyticsService.getGrowthIcon(value);
  }

  getPeriodRange(): string {
    const now = new Date();
    let startDate: Date;

    switch (this.selectedPeriod) {
      case AnalyticsPeriod.Today:
        startDate = new Date(now);
        break;
      case AnalyticsPeriod.Week:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case AnalyticsPeriod.Month:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case AnalyticsPeriod.Quarter:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case AnalyticsPeriod.Year:
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return startDate.toISOString().split('T')[0];
  }

  getPeriodLabel(): string {
    const labels = {
      [AnalyticsPeriod.Today]: 'Bugun',
      [AnalyticsPeriod.Week]: 'Oxirgi 7 kun',
      [AnalyticsPeriod.Month]: 'Oxirgi 30 kun',
      [AnalyticsPeriod.Quarter]: 'Oxirgi 3 oy',
      [AnalyticsPeriod.Year]: 'Oxirgi yil',
      [AnalyticsPeriod.All]: 'Barcha vaqt',
    };
    return labels[this.selectedPeriod] || this.selectedPeriod;
  }

  getMax(arr: any[], key: string): number {
    if (!arr || !arr.length) return 1;
    const max = Math.max(...arr.map((item) => item[key] || 0));
    return max > 0 ? max : 1;
  }

  getSum(arr: any[], key: string): number {
    if (!arr || !arr.length) return 0;
    return arr.reduce((sum, item) => sum + (item[key] || 0), 0);
  }

  // Overview metrics getters
  get overview(): OverviewMetrics | null {
    return this.analytics?.overview || null;
  }

  get revenue(): RevenueAnalytics | null {
    return this.analytics?.revenue || null;
  }

  get users(): UserAnalytics | null {
    return this.analytics?.users || null;
  }

  get properties(): PropertyAnalytics | null {
    return this.analytics?.properties || null;
  }

  get bookings(): BookingAnalytics | null {
    return this.analytics?.bookings || null;
  }

  get views(): ViewAnalytics | null {
    return this.analytics?.views || null;
  }

  get recommendations(): RecommendationAnalytics | null {
    return this.analytics?.recommendations || null;
  }

  // Export functionality
  exportData(format: 'csv' | 'excel' | 'pdf'): void {
    this.analyticsService
      .exportAnalytics('dashboard', format, {
        startDate: this.getPeriodRange(),
        endDate: new Date().toISOString().split('T')[0],
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `analytics-${this.selectedPeriod}.${format}`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.logger.error('Error exporting data:', err);
          alert("Ma'lumotlarni eksport qilishda xatolik");
        },
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
