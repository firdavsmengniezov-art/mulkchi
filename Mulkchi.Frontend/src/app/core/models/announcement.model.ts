export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  isActive: boolean;
  expiresAt?: string;
  targetAudience?: string;
  createdBy: string;
  createdDate: string;
  updatedDate?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  expiresAt?: string;
  targetAudience?: string;
}

export interface UpdateAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  isActive?: boolean;
  expiresAt?: string;
  targetAudience?: string;
}

export enum AnnouncementType {
  General = 'General',
  Maintenance = 'Maintenance',
  Feature = 'Feature',
  Promotion = 'Promotion',
  Urgent = 'Urgent'
}

export enum AnnouncementPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}
