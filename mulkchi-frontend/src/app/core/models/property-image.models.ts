export interface PropertyImage {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
  propertyId: string;
  createdDate: string;
  updatedDate: string;
  deletedDate?: string;
}
