export interface Announcement {
  id: string;
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  contentUz: string;
  contentRu?: string;
  contentEn?: string;
  expiresAt: string | null;
  createdDate: string;
}
