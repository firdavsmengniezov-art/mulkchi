export type AnnouncementType =
  | 'General'
  | 'Maintenance'
  | 'Promotion'
  | 'PolicyUpdate';
export type AnnouncementTarget = 'AllUsers' | 'Hosts' | 'Guests' | 'Admins';

export interface Announcement {
  id: string;
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  contentUz: string;
  contentRu?: string;
  contentEn?: string;
  type: AnnouncementType;
  target: AnnouncementTarget;
  isActive: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
