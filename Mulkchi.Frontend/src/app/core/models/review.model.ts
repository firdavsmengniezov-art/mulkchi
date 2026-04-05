export interface Review {
  id: string;
  propertyId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  overallRating: number;
  cleanlinessRating: number;
  locationRating: number;
  valueRating: number;
  communicationRating: number;
  accuracyRating: number;
  comment: string;
  hostResponse?: string;
  hostRespondedAt?: Date;
  createdDate: Date;
  updatedDate: Date;
  isVerifiedStay: boolean;
  homeRequestId?: string;
}

export interface CreateReviewRequest {
  propertyId: string;
  overallRating: number;
  cleanlinessRating: number;
  locationRating: number;
  valueRating: number;
  communicationRating: number;
  accuracyRating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number;
  comment: string;
  createdDate: string;
  cleanliness?: number;
  location?: number;
  value?: number;
  communication?: number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  cleanliness: number;
  location: number;
  value: number;
  communication: number;
  ratingDistribution: Record<number, number>;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
