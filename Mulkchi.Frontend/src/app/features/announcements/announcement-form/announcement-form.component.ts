import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AnnouncementPriority,
  AnnouncementType,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../../../core/models';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { LoggingService } from '../../../core/services/logging.service';

@Component({
  selector: 'app-announcement-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcement-form.component.html',
  styleUrls: ['./announcement-form.component.scss'],
})
export class AnnouncementFormComponent implements OnInit {
  today = new Date();
  isEditMode = false;
  announcementId: string | null = null;
  loading = false;
  saving = false;
  error = '';

  // Form data
  formData: CreateAnnouncementRequest = {
    title: '',
    content: '',
    type: AnnouncementType.General,
    priority: AnnouncementPriority.Medium,
    expiresAt: '',
    targetAudience: '',
  };

  // Enums for template
  announcementTypes = Object.values(AnnouncementType);
  announcementPriorities = Object.values(AnnouncementPriority);

  constructor(
    private announcementService: AnnouncementService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private logger: LoggingService) {}

  ngOnInit(): void {
    this.checkEditMode();
    if (this.isEditMode && this.announcementId) {
      this.loadAnnouncement();
    }
  }

  private checkEditMode(): void {
    this.announcementId = this.activatedRoute.snapshot.paramMap.get('id');
    this.isEditMode = this.announcementId !== 'new' && !!this.announcementId;
  }

  private loadAnnouncement(): void {
    if (!this.announcementId) return;

    this.loading = true;
    this.error = '';

    this.announcementService.getAnnouncementById(this.announcementId).subscribe({
      next: (announcement) => {
        this.formData = {
          title: announcement.title,
          content: announcement.content,
          type: announcement.type,
          priority: announcement.priority,
          expiresAt: announcement.expiresAt
            ? new Date(announcement.expiresAt).toISOString().slice(0, 16)
            : '',
          targetAudience: announcement.targetAudience || '',
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load announcement';
        this.logger.error('Error loading announcement:', err);
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.saving || !this.isFormValid()) return;

    this.saving = true;
    this.error = '';

    const observable =
      this.isEditMode && this.announcementId
        ? this.announcementService.updateAnnouncement({
            id: this.announcementId,
            ...this.formData,
          } as UpdateAnnouncementRequest)
        : this.announcementService.createAnnouncement(this.formData);

    observable.subscribe({
      next: (announcement) => {
        const successMessage = this.isEditMode
          ? 'Announcement updated successfully!'
          : 'Announcement created successfully!';

        alert(successMessage);
        this.saving = false;
        this.router.navigate(['/admin/announcements']);
      },
      error: (err) => {
        this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} announcement`;
        this.logger.error('Error saving announcement:', err);
        this.saving = false;
      },
    });
  }

  onCancel(): void {
    this.location.back();
  }

  // Form validation
  isFormValid(): boolean {
    return !!(
      this.formData.title.trim() &&
      this.formData.content.trim() &&
      this.formData.type &&
      this.formData.priority
    );
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

  get isFormDirty(): boolean {
    return !!(
      this.formData.title.trim() ||
      this.formData.content.trim() ||
      this.formData.expiresAt ||
      this.formData.targetAudience?.trim()
    );
  }

  // Character counters
  get titleCharCount(): number {
    return this.formData.title.length;
  }

  get contentCharCount(): number {
    return this.formData.content.length;
  }

  // Set minimum expiry date to today
  get minExpiryDate(): string {
    return new Date().toISOString().slice(0, 16);
  }
}
