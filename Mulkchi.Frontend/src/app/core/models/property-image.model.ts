export interface PropertyImage {
  id: string;
  propertyId: string;
  /** Full-size WebP URL */
  url?: string;
  /** Medium variant (800×600 WebP) */
  mediumUrl?: string;
  /** Thumbnail variant (300×200 WebP) */
  thumbnailUrl?: string;
  /** Legacy alias kept for backward compatibility */
  imageUrl?: string;
  imageTitle?: string;
  imageDescription?: string;
  isPrimary: boolean;
  displayOrder: number;
  sortOrder?: number;
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
