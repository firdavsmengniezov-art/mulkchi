import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Announcement, AnnouncementType } from '../../core/models/announcement.models';
import { AnnouncementService } from '../../core/services/announcement.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="announcements-page page-wrapper">
      <div class="page-header">
        <h1>📢 E'lonlar</h1>
        <p class="subtitle">Mulkchi platformasidagi yangiliklar va e'lonlar</p>
      </div>

      <div class="announcements-list" *ngIf="announcements.length > 0; else emptyTpl">
        <div class="announcement-card card-dark" *ngFor="let ann of announcements">
          <div class="ann-header">
            <span class="type-badge" [ngClass]="getTypeBadgeClass(ann.type)">
              {{ getTypeLabel(ann.type) }}
            </span>
            <span class="ann-date">{{ ann.publishedAt | date: 'dd.MM.yyyy' }}</span>
          </div>
          <h3 class="ann-title">{{ ann.titleUz }}</h3>
          <p class="ann-content">
            {{ isExpanded(ann.id) ? ann.contentUz : (ann.contentUz | slice:0:200) }}
            <span *ngIf="!isExpanded(ann.id) && ann.contentUz.length > 200">...</span>
          </p>
          <button
            *ngIf="ann.contentUz.length > 200"
            class="expand-btn"
            (click)="toggleExpand(ann.id)"
          >
            {{ isExpanded(ann.id) ? getCollapseLabel() : getExpandLabel() }}
          </button>
          <div class="ann-footer" *ngIf="ann.expiresAt">
            <span class="expires">📅 Muddati: {{ ann.expiresAt | date: 'dd.MM.yyyy' }}</span>
          </div>
        </div>
      </div>

      <ng-template #emptyTpl>
        <div class="empty-state">
          <p>Hozircha e'lonlar yo'q</p>
        </div>
      </ng-template>

      <div class="pagination" *ngIf="totalCount > pageSize">
        <button
          class="page-btn"
          [disabled]="page <= 1"
          (click)="changePage(page - 1)"
        >‹</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button
          class="page-btn"
          [disabled]="page >= totalPages"
          (click)="changePage(page + 1)"
        >›</button>
      </div>
    </div>
  `,
  styleUrls: ['./announcements.component.scss'],
})
export class AnnouncementsComponent implements OnInit {
  private readonly announcementService = inject(AnnouncementService);

  announcements: Announcement[] = [];
  page = 1;
  pageSize = 10;
  totalCount = 0;
  expandedIds = new Set<string>();

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.announcementService.getAll(this.page, this.pageSize).subscribe({
      next: (result) => {
        this.announcements = result.items;
        this.totalCount = result.totalCount;
      },
      error: () => {},
    });
  }

  changePage(p: number): void {
    this.page = p;
    this.load();
  }

  isExpanded(id: string): boolean {
    return this.expandedIds.has(id);
  }

  toggleExpand(id: string): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  getExpandLabel(): string { return "Ko'proq"; }
  getCollapseLabel(): string { return "Yig'ish"; }

  getTypeLabel(type: AnnouncementType): string {
    const labels: Record<number, string> = {
      [AnnouncementType.General]: 'Umumiy',
      [AnnouncementType.Maintenance]: 'Texnik ishlar',
      [AnnouncementType.Promotion]: 'Aksiya',
      [AnnouncementType.PolicyUpdate]: "Qoidalar o'zgarishi",
    };
    return labels[type] ?? String(type);
  }

  getTypeBadgeClass(type: AnnouncementType): string {
    const classes: Record<number, string> = {
      [AnnouncementType.General]: 'badge-general',
      [AnnouncementType.Maintenance]: 'badge-maintenance',
      [AnnouncementType.Promotion]: 'badge-promotion',
      [AnnouncementType.PolicyUpdate]: 'badge-policy',
    };
    return classes[type] ?? 'badge-general';
  }
}
