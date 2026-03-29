export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  createdDate: string;
}

export interface FavoriteToggleResult {
  isFavorited: boolean;
  favoritesCount: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: string;
  listingType: string;
  monthlyRent?: number;
  salePrice?: number;
  pricePerNight?: number;
  area: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  maxGuests?: number;
  region: string;
  city: string;
  district: string;
  address: string;
  mahalla: string;
  latitude?: number;
  longitude?: number;
  hasWifi: boolean;
  hasParking: boolean;
  hasElevator: boolean;
  hasSecurity: boolean;
  hasGenerator: boolean;
  hasGas: boolean;
  hasFurniture: boolean;
  isRenovated: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasWasher: boolean;
  hasKitchen: boolean;
  hasTV: boolean;
  hasWorkspace: boolean;
  isSelfCheckIn: boolean;
  isChildFriendly: boolean;
  isAccessible: boolean;
  averageRating: number;
  viewsCount: number;
  favoritesCount: number;
  hostId: string;
  currency: string;
  exchangeRate: number;
  imageUrl?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
