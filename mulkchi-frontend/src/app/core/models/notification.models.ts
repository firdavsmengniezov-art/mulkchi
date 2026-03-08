export interface Notification {
  id: string;
  userId: string;
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  bodyUz: string;
  bodyRu?: string;
  bodyEn?: string;
  isRead: boolean;
  createdDate: string;
}
