export interface SavedSearch {
  id: string;
  name: string;
  city?: string;
  type?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  isActive: boolean;
  notifyByEmail: boolean;
  notifyByPush: boolean;
  createdAt: string;
  lastNotifiedAt?: string;
  updatedAt: string;
}

export interface CreateSavedSearchRequest {
  name: string;
  city?: string;
  type?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  isActive?: boolean;
  notifyByEmail?: boolean;
  notifyByPush?: boolean;
}

export interface SavedSearchResponse {
  success: boolean;
  message: string;
  data?: SavedSearch;
}

export interface SavedSearchesResponse {
  success: boolean;
  message: string;
  data?: {
    items: SavedSearch[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
}
