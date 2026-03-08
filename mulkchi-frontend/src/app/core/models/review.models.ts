export interface Review {
  id: string;
  overallRating: number;
  cleanlinessRating: number;
  locationRating: number;
  valueRating: number;
  communicationRating: number;
  accuracyRating: number;
  comment: string;
  isVerifiedStay: boolean;
  hostResponse?: string;
  hostRespondedAt?: string;
  reviewerId: string;
  propertyId: string;
  homeRequestId?: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
