export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  imageTitle?: string;
  imageDescription?: string;
  isPrimary: boolean;
  displayOrder: number;
  createdDate: string;
  updatedDate?: string;
}

export interface CreatePropertyImageRequest {
  propertyId: string;
  imageTitle?: string;
  imageDescription?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface UpdatePropertyImageRequest {
  id: string;
  imageTitle?: string;
  imageDescription?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface PropertyImageUploadRequest {
  propertyId: string;
  files: File[];
  imageTitles?: string[];
  imageDescriptions?: string[];
}
