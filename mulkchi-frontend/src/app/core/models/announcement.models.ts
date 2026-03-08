export enum AnnouncementType { General = 0, Maintenance = 1, Promotion = 2, PolicyUpdate = 3 }
export enum AnnouncementTarget { AllUsers = 0, Hosts = 1, Guests = 2, Admins = 3 }

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
