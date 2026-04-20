import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PropertyService } from '../../../core/services/property.service';
import { AuthService } from '../../../core/services/auth.service';
import { Property, PropertyStatus, ListingType } from '../../../core/models';

@Component({
  selector: 'app-host-properties',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="host-properties-container">
      <div class="container">
        <div class="page-header">
          <div class="header-content">
            <h1>Mening mulklarim</h1>
            <p>Barcha e'lonlaringizni boshqaring</p>
          </div>
          <a mat-raised-button color="primary" routerLink="/host/properties/create">
            <mat-icon>add</mat-icon>
            Yangi mulk qo'shish
          </a>
        </div>

        @if (loading()) {
          <div class="loading-container">
            <mat-progress-spinner diameter="50"></mat-progress-spinner>
            <p>Yuklanmoqda...</p>
          </div>
        } @else if (properties().length === 0) {
          <div class="empty-container">
            <mat-icon>home_work</mat-icon>
            <h3>Hali mulk e'lonlari yo'q</h3>
            <p>O'z mulkingizni e'lon qilish uchun yangi mulk qo'shing</p>
            <a mat-raised-button color="primary" routerLink="/host/properties/create">
              <mat-icon>add</mat-icon>
              Mulk qo'shish
            </a>
          </div>
        } @else {
          <!-- Stats Cards -->
          <div class="stats-cards">
            <mat-card class="stat-card">
              <mat-icon>home</mat-icon>
              <div class="stat-info">
                <span class="value">{{ properties().length }}</span>
                <span class="label">Jami mulklar</span>
              </div>
            </mat-card>
            <mat-card class="stat-card">
              <mat-icon>visibility</mat-icon>
              <div class="stat-info">
                <span class="value">{{ totalViews() }}</span>
                <span class="label">Ko'rishlar</span>
              </div>
            </mat-card>
            <mat-card class="stat-card">
              <mat-icon>favorite</mat-icon>
              <div class="stat-info">
                <span class="value">{{ totalFavorites() }}</span>
                <span class="label">Sevimlilar</span>
              </div>
            </mat-card>
            <mat-card class="stat-card">
              <mat-icon>event_note</mat-icon>
              <div class="stat-info">
                <span class="value">{{ activeBookings() }}</span>
                <span class="label">Faol bronlar</span>
              </div>
            </mat-card>
          </div>

          <!-- Properties Table -->
          <mat-card class="table-card">
            <table mat-table [dataSource]="properties()">
              <!-- Image Column -->
              <ng-container matColumnDef="image">
                <th mat-header-cell *matHeaderCellDef>Rasm</th>
                <td mat-cell *matCellDef="let property">
                  <div class="table-image">
                    @if (property.images && property.images.length > 0) {
                      <img [src]="property.images[0].imageUrl" [alt]="property.title">
                    } @else {
                      <div class="no-image">
                        <mat-icon>image_not_supported</mat-icon>
                      </div>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Title Column -->
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Sarlavha</th>
                <td mat-cell *matCellDef="let property">
                  <div class="title-cell">
                    <span class="title">{{ property.title }}</span>
                    <span class="location">{{ property.city }}, {{ property.district }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Turi</th>
                <td mat-cell *matCellDef="let property">
                  <span class="type-badge">{{ property.type }}</span>
                </td>
              </ng-container>

              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Narx</th>
                <td mat-cell *matCellDef="let property">
                  <div class="price-cell">
                    <span class="price">{{ getPrice(property) | number }} {{ property.currency }}</span>
                    <span class="period">{{ getPricePeriod(property) }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let property">
                  <span class="status-badge" [class]="property.status.toLowerCase()">
                    {{ getStatusLabel(property.status) }}
                  </span>
                </td>
              </ng-container>

              <!-- Stats Column -->
              <ng-container matColumnDef="stats">
                <th mat-header-cell *matHeaderCellDef>Statistika</th>
                <td mat-cell *matCellDef="let property">
                  <div class="stats-cell">
                    <span matTooltip="Ko'rishlar">
                      <mat-icon>visibility</mat-icon>
                      {{ property.viewsCount }}
                    </span>
                    <span matTooltip="Sevimlilar">
                      <mat-icon>favorite</mat-icon>
                      {{ property.favoritesCount }}
                    </span>
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Amallar</th>
                <td mat-cell *matCellDef="let property">
                  <div class="actions-cell">
                    <a mat-icon-button [routerLink]="['/properties', property.id]" matTooltip="Ko'rish">
                      <mat-icon>visibility</mat-icon>
                    </a>
                    <a mat-icon-button [routerLink]="['/host/properties/edit', property.id]" matTooltip="Tahrirlash">
                      <mat-icon>edit</mat-icon>
                    </a>
                    <button mat-icon-button color="warn" (click)="deleteProperty(property.id)" matTooltip="O'chirish">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator
              [length]="properties().length"
              [pageSize]="pageSize()"
              [pageSizeOptions]="[5, 10, 20]"
              (page)="onPageChange($event)">
            </mat-paginator>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .host-properties-container {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
      padding: 40px 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-content h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .header-content p {
      color: #666;
    }

    .loading-container,
    .empty-container {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }

    .stat-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #667eea;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-info .value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
    }

    .stat-info .label {
      font-size: 0.9rem;
      color: #666;
    }

    .table-card {
      overflow: auto;
    }

    table {
      width: 100%;
    }

    .table-image {
      width: 80px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
    }

    .table-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0e0e0;
    }

    .no-image mat-icon {
      font-size: 24px;
      color: #999;
    }

    .title-cell {
      display: flex;
      flex-direction: column;
    }

    .title-cell .title {
      font-weight: 500;
      color: #333;
    }

    .title-cell .location {
      font-size: 0.85rem;
      color: #666;
    }

    .type-badge {
      padding: 4px 12px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .price-cell {
      display: flex;
      flex-direction: column;
    }

    .price-cell .price {
      font-weight: 600;
      color: #333;
    }

    .price-cell .period {
      font-size: 0.8rem;
      color: #666;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #e8f5e9;
      color: #388e3c;
    }

    .status-badge.draft {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-badge.sold {
      background: #ffebee;
      color: #c62828;
    }

    .status-badge.archived {
      background: #f5f5f5;
      color: #666;
    }

    .stats-cell {
      display: flex;
      gap: 16px;
    }

    .stats-cell span {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 0.9rem;
    }

    .stats-cell mat-icon {
      font-size: 18px;
      color: #999;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
    }

    @media (max-width: 1024px) {
      .stats-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .stats-cards {
        grid-template-columns: 1fr;
      }

      .table-card {
        overflow-x: auto;
      }
    }
  `]
})
export class HostPropertiesComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  properties = signal<Property[]>([]);
  loading = signal(true);
  pageSize = signal(10);
  displayedColumns = ['image', 'title', 'type', 'price', 'status', 'stats', 'actions'];

  // Stats signals
  totalViews = signal(0);
  totalFavorites = signal(0);
  activeBookings = signal(0);

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.loading.set(true);
    
    this.propertyService.getHostProperties().subscribe({
      next: (properties) => {
        this.properties.set(properties);
        this.calculateStats(properties);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Mulklarni yuklashda xatolik', 'Yopish', { duration: 3000 });
      }
    });
  }

  calculateStats(properties: Property[]): void {
    const views = properties.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    const favorites = properties.reduce((sum, p) => sum + (p.favoritesCount || 0), 0);
    
    this.totalViews.set(views);
    this.totalFavorites.set(favorites);
    this.activeBookings.set(0); // Would be fetched from bookings API
  }

  getPrice(property: Property): number {
    return property.salePrice || property.monthlyRent || property.pricePerNight || 0;
  }

  getPricePeriod(property: Property): string {
    if (property.salePrice) return '';
    if (property.monthlyRent) return '/oy';
    if (property.pricePerNight) return '/tun';
    return '';
  }

  getStatusLabel(status: PropertyStatus): string {
    switch (status) {
      case 'Active': return 'Faol';
      case 'Draft': return 'Qoralama';
      case 'Sold': return 'Sotildi';
      case 'Rented': return 'Ijaraga berildi';
      case 'Archived': return 'Arxivlangan';
      default: return status;
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
  }

  deleteProperty(id: string): void {
    if (confirm('Haqiqatan ham bu mulkni o\'chirmoqchimisiz?')) {
      this.propertyService.deleteProperty(id).subscribe({
        next: () => {
          this.snackBar.open('Mulk o\'chirildi', 'Yopish', { duration: 3000 });
          this.loadProperties();
        },
        error: () => {
          this.snackBar.open('O\'chirishda xatolik', 'Yopish', { duration: 3000 });
        }
      });
    }
  }
}
