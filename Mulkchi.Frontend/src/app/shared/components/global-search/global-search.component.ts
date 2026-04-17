import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { AnnouncementService } from '../../../core/services/announcement.service';
import { PropertyService } from '../../../core/services/property.service';
import { UserService } from '../../../core/services/user.service';
import { Property, PropertySearchParams } from '../../../core/models/property.model';
import { PagedResult } from '../../../core/models/paged-result.model';
import { User } from '../../../core/models/user.model';
import { Announcement } from '../../../core/models/announcement.model';

// Service return types (not full PagedResult)
interface UserSearchResult {
  items: User[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface AnnouncementSearchResult {
  items: Announcement[];
  totalCount: number;
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
})
export class GlobalSearchComponent implements OnInit {
  @Output() searchClosed = new EventEmitter<void>();

  searchQuery = '';
  isSearching = false;
  searchResults: SearchResult[] = [];
  selectedCategory = 'all';

  private searchSubject = new Subject<string>();

  constructor(
    private propertyService: PropertyService,
    private userService: UserService,
    private announcementService: AnnouncementService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.performSearch(query)),
      )
      .subscribe((results) => {
        this.searchResults = results;
        this.isSearching = false;
      });
  }

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.searchSubject.next(this.searchQuery);
  }

  private performSearch(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Search properties using the real backend search endpoint with query param
    if (this.selectedCategory === 'all' || this.selectedCategory === 'properties') {
      return new Promise((resolve) => {
        this.propertyService
          .searchProperties({ page: 1, pageSize: 5, location: query } as PropertySearchParams)
          .subscribe({
            next: (response: PagedResult<Property>) => {
              const items: Property[] = response.items || [];
              items.forEach((property: Property) => {
                const price =
                  property.monthlyRent || property.salePrice || property.pricePerNight || 0;
                const imageUrl =
                  property.images?.[0]?.thumbnailUrl ||
                  property.images?.[0]?.url ||
                  '/assets/images/placeholder-property.svg';
                results.push({
                  type: 'property',
                  id: property.id,
                  title: property.title,
                  description: property.description,
                  subtitle: `${property.city}, ${property.region} • ${price.toLocaleString('uz-UZ')} UZS`,
                  imageUrl,
                  url: `/properties/${property.id}`,
                });
              });
              resolve(results);
            },
            error: () => resolve(results),
          });
      });
    }

    // Search users (admin only)
    if ((this.selectedCategory === 'all' || this.selectedCategory === 'users') && this.isAdmin()) {
      return new Promise((resolve) => {
        this.userService.searchUsers(query, 1, 5).subscribe({
          next: (response: UserSearchResult) => {
            response.items.forEach((user: User) => {
              results.push({
                type: 'user',
                id: user.id,
                title: `${user.firstName} ${user.lastName}`,
                description: user.email,
                subtitle: `${user.role} • ${user.status}`,
                imageUrl: user.avatar || '/assets/images/placeholder-user.jpg',
                url: `/admin/users/${user.id}`,
              });
            });
            resolve(results);
          },
          error: () => resolve(results),
        });
      });
    }

    // Search announcements
    if (this.selectedCategory === 'all' || this.selectedCategory === 'announcements') {
      return new Promise((resolve) => {
        this.announcementService.getAnnouncements(1, 5).subscribe({
          next: (response: AnnouncementSearchResult) => {
            const items: Announcement[] = response.items || [];
            const lowerQuery = query.toLowerCase();
            items
              .filter(
                (a: Announcement) =>
                  a.title?.toLowerCase().includes(lowerQuery) ||
                  a.content?.toLowerCase().includes(lowerQuery),
              )
              .forEach((announcement: Announcement) => {
                results.push({
                  type: 'announcement',
                  id: announcement.id,
                  title: announcement.title,
                  description: announcement.content,
                  subtitle: `${announcement.type} • ${announcement.priority}`,
                  imageUrl: '/assets/images/placeholder-announcement.jpg',
                  url: `/announcements/${announcement.id}`,
                });
              });
            resolve(results);
          },
          error: () => resolve(results),
        });
      });
    }

    return Promise.resolve(results);
  }

  selectResult(result: SearchResult): void {
    this.router.navigate([result.url]);
    this.closeSearch();
  }

  closeSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.searchClosed.emit();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    if (this.searchQuery.trim()) {
      this.onSearchInput();
    }
  }

  // Helper methods
  getResultIcon(type: string): string {
    const icons: Record<string, string> = {
      property: '🏠',
      user: '👤',
      announcement: '📢',
    };
    return icons[type] || '📄';
  }

  getResultTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      property: "Ob'ekt",
      user: 'Foydalanuvchi',
      announcement: "E'lon",
    };
    return labels[type] || type;
  }

  getResultTypeColor(type: string): string {
    const colors: Record<string, string> = {
      property: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
      announcement: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  isAdmin(): boolean {
    // This would check current user role
    // For now, return false as placeholder
    return false;
  }

  get hasResults(): boolean {
    return this.searchResults.length > 0;
  }

  get showNoResults(): boolean {
    return !this.isSearching && !!this.searchQuery.trim() && this.searchResults.length === 0;
  }
}

interface SearchResult {
  type: 'property' | 'user' | 'announcement';
  id: string;
  title: string;
  description: string;
  subtitle: string;
  imageUrl: string;
  url: string;
}
