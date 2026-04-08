import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SavedSearchService } from '../../../core/services/saved-search.service';
import { SavedSearch } from '../../../core/models/saved-search.model';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-saved-search-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="saved-search-list">
      <div class="page-header">
        <h1>Saqlangan qidiruvlar</h1>
        <p>O'zing qidiruv parametrlarini saqlang va yangi mulklar haqida bildirishnomalarni oling</p>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Qidiruvlar yuklanmoqda...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && savedSearches.length === 0">
        <div class="empty-icon">🔍</div>
        <h3>Hali qidiruvlar saqlanmagan</h3>
        <p>Mulk qidiruvingiz va natijalarni saqlang</p>
        <a routerLink="/properties" class="btn btn-primary">Mulkklarni ko'rish</a>
      </div>

      <!-- Saved Searches List -->
      <div class="searches-list" *ngIf="!isLoading && savedSearches.length > 0">
        <div class="search-card" *ngFor="let search of savedSearches">
          <div class="search-header">
            <div class="search-info">
              <h4>{{ search.name }}</h4>
              <p class="search-summary">{{ getSearchSummary(search) }}</p>
            </div>
            <div class="search-actions">
              <div class="status-toggle">
                <label class="switch">
                  <input 
                    type="checkbox" 
                    [checked]="search.isActive"
                    (change)="toggleSearch(search.id, $event)"
                  >
                  <span class="slider"></span>
                </label>
                <span class="status-text">{{ isActiveStatus(search.isActive) }}</span>
              </div>
            </div>
          </div>

          <div class="search-details">
            <div class="detail-row">
              <span>Bildirishlar:</span>
              <span>{{ getNotificationSettings(search) }}</span>
            </div>
            <div class="detail-row">
              <span>Yaratilgan:</span>
              <span>{{ formatDate(search.createdAt) }}</span>
            </div>
            <div class="detail-row" *ngIf="search.lastNotifiedAt">
              <span>Oxirgi bildirish:</span>
              <span>{{ formatDate(search.lastNotifiedAt) }}</span>
            </div>
          </div>

          <div class="search-actions">
            <button 
              class="btn btn-sm btn-primary"
              (click)="searchProperties(search)">
              🔍 Qidirish
            </button>
            <button 
              class="btn btn-sm btn-secondary"
              (click)="editSearch(search)">
              ✏️ Tahrirlash
            </button>
            <button 
              class="btn btn-sm btn-danger"
              (click)="deleteSearch(search.id)">
              🗑️ O'chirish
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="!isLoading && savedSearches.length > 0">
        <button 
          class="btn btn-outline" 
          [disabled]="currentPage === 1"
          (click)="previousPage()">
          ← Oldingi
        </button>
        
        <span class="page-info">
          Sahifa {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          class="btn btn-outline" 
          [disabled]="currentPage === totalPages"
          (click)="nextPage()">
          Keyingi →
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./saved-search-list.component.scss']
})
export class SavedSearchListComponent implements OnInit {
  savedSearches: SavedSearch[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  constructor(private savedSearchService: SavedSearchService,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.loadSavedSearches();
  }

  loadSavedSearches(): void {
    this.isLoading = true;
    this.savedSearchService.getSavedSearches(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.savedSearches = response.data.items;
          this.totalCount = response.data.totalCount;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading saved searches:', error);
        this.isLoading = false;
      }
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSavedSearches();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSavedSearches();
    }
  }

  searchProperties(search: SavedSearch): void {
    // Navigate to properties page with search parameters
    const params = this.buildSearchParams(search);
    // this.router.navigate(['/properties'], { queryParams: params });
    this.logger.log('Searching with params:', params);
  }

  editSearch(search: SavedSearch): void {
    // Open edit modal or navigate to edit page
    this.logger.log('Editing search:', search);
  }

  deleteSearch(id: string): void {
    if (confirm('Bu qidiruvni o\'chirmoqchimisiz?')) {
      this.savedSearchService.deleteSavedSearch(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSavedSearches(); // Reload the list
          }
        },
        error: (error) => {
          this.logger.error('Error deleting saved search:', error);
        }
      });
    }
  }

  toggleSearch(id: string, event: any): void {
    this.savedSearchService.toggleSavedSearch(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Update local state
          const search = this.savedSearches.find(s => s.id === id);
          if (search) {
            search.isActive = event.target.checked;
          }
        }
      },
      error: (error) => {
        this.logger.error('Error toggling saved search:', error);
      }
    });
  }

  // Utility methods
  private buildSearchParams(search: SavedSearch): any {
    const params: any = {};
    
    if (search.city) params.city = search.city;
    if (search.type) params.type = search.type;
    if (search.listingType) params.listingType = search.listingType;
    if (search.minPrice) params.minPrice = search.minPrice;
    if (search.maxPrice) params.maxPrice = search.maxPrice;
    if (search.minArea) params.minArea = search.minArea;
    if (search.maxArea) params.maxArea = search.maxArea;
    if (search.minBedrooms) params.minBedrooms = search.minBedrooms;
    
    return params;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getSearchSummary(search: SavedSearch): string {
    return this.savedSearchService.getSearchSummary(search);
  }

  isActiveStatus(isActive: boolean): string {
    return this.savedSearchService.isActiveStatus(isActive);
  }

  getNotificationSettings(search: SavedSearch): string {
    return this.savedSearchService.getNotificationSettings(search);
  }
}
