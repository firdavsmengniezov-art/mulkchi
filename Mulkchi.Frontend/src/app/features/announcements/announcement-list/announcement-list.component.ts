import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Announcement, AnnouncementPriority, AnnouncementType } from '../../../core/models';
import { AnnouncementService } from '../../../core/services/announcement.service';

@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.scss'],
})
export class AnnouncementListComponent implements OnInit {
  Math = Math;
  announcements: Announcement[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  // Filter options
  selectedType: string = '';
  selectedStatus: string = '';

  // Enums for template
  announcementTypes = Object.values(AnnouncementType);
  announcementPriorities = Object.values(AnnouncementPriority);

  constructor(
    private announcementService: AnnouncementService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.loading = true;
    this.error = '';

    this.announcementService.getAnnouncements(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.announcements = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load announcements';
        console.error('Error loading announcements:', err);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAnnouncements();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAnnouncements();
  }

  toggleAnnouncementStatus(announcement: Announcement): void {
    const newStatus = !announcement.isActive;

    this.announcementService.toggleAnnouncementStatus(announcement.id, newStatus).subscribe({
      next: (updatedAnnouncement) => {
        // Update the announcement in the list
        const index = this.announcements.findIndex((a) => a.id === announcement.id);
        if (index !== -1) {
          this.announcements[index] = updatedAnnouncement;
        }
      },
      error: (err) => {
        console.error('Error toggling announcement status:', err);
        alert('Failed to update announcement status');
      },
    });
  }

  deleteAnnouncement(announcement: Announcement): void {
    if (confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      this.announcementService.deleteAnnouncement(announcement.id).subscribe({
        next: () => {
          this.announcements = this.announcements.filter((a) => a.id !== announcement.id);
          this.totalCount--;
        },
        error: (err) => {
          console.error('Error deleting announcement:', err);
          alert('Failed to delete announcement');
        },
      });
    }
  }

  editAnnouncement(announcement: Announcement): void {
    this.router.navigate(['/admin/announcements', announcement.id, 'edit']);
  }

  createAnnouncement(): void {
    this.router.navigate(['/admin/announcements', 'new']);
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAnnouncements();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  // Helper methods for display
  getTypeLabel(type: AnnouncementType): string {
    const typeLabels = {
      [AnnouncementType.General]: 'General',
      [AnnouncementType.Maintenance]: 'Maintenance',
      [AnnouncementType.Feature]: 'New Feature',
      [AnnouncementType.Promotion]: 'Promotion',
      [AnnouncementType.Urgent]: 'Urgent',
    };
    return typeLabels[type] || type;
  }

  getPriorityLabel(priority: AnnouncementPriority): string {
    const priorityLabels = {
      [AnnouncementPriority.Low]: 'Low',
      [AnnouncementPriority.Medium]: 'Medium',
      [AnnouncementPriority.High]: 'High',
      [AnnouncementPriority.Critical]: 'Critical',
    };
    return priorityLabels[priority] || priority;
  }

  getPriorityColor(priority: AnnouncementPriority): string {
    const colors = {
      [AnnouncementPriority.Low]: 'bg-gray-100 text-gray-800',
      [AnnouncementPriority.Medium]: 'bg-blue-100 text-blue-800',
      [AnnouncementPriority.High]: 'bg-orange-100 text-orange-800',
      [AnnouncementPriority.Critical]: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }

  getTypeColor(type: AnnouncementType): string {
    const colors = {
      [AnnouncementType.General]: 'bg-gray-100 text-gray-800',
      [AnnouncementType.Maintenance]: 'bg-yellow-100 text-yellow-800',
      [AnnouncementType.Feature]: 'bg-green-100 text-green-800',
      [AnnouncementType.Promotion]: 'bg-purple-100 text-purple-800',
      [AnnouncementType.Urgent]: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  get filteredAnnouncements(): Announcement[] {
    return this.announcements.filter((announcement) => {
      const matchesSearch =
        announcement.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = !this.selectedType || announcement.type === this.selectedType;
      const matchesStatus =
        !this.selectedStatus ||
        (this.selectedStatus === 'active' && announcement.isActive) ||
        (this.selectedStatus === 'inactive' && !announcement.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  get isEmpty(): boolean {
    return !this.loading && this.filteredAnnouncements.length === 0;
  }
}
