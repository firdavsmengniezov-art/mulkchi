export enum PropertyType { Apartment='Apartment', House='House', Office='Office', Land='Land', Commercial='Commercial' }
export enum ListingType { Rent='Rent', Sale='Sale', DailyRent='DailyRent' }
export enum PropertyStatus { Available='Available', Rented='Rented', Sold='Sold', Inactive='Inactive' }

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
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
  latitude?: number;
  longitude?: number;
  hasWifi: boolean;
  hasParking: boolean;
  hasPool: boolean;
  hasMetroNearby: boolean;
  hasElevator: boolean;
  hasAirConditioning: boolean;
  isRenovated: boolean;
  isPetFriendly: boolean;
  hasBalcony: boolean;
  averageRating: number;
  viewsCount: number;
  favoritesCount: number;
  hostId: string;
  currency: string;
  exchangeRate?: number;
  createdDate: string;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface PropertySearchParams {
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  listingType?: string;
  propertyType?: string;
  pageNumber?: number;
  pageSize?: number;
}
