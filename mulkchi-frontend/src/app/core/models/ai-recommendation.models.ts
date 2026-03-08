export interface AiRecommendation {
  id: string;
  score: number;
  title?: string;
  description?: string;
  isActedUpon: boolean;
  metadata?: string;
  userId: string;
  propertyId?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
